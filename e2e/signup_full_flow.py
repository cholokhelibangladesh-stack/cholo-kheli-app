"""
End-to-end signup flow:
  1. Create a disposable mail.tm inbox.
  2. Open /auth on the preview URL, fill player signup, upload a stub birth-cert PDF, submit.
  3. Poll mail.tm for the Supabase confirmation email.
  4. Extract the confirm link, open it in the browser.
  5. Assert the browser lands on the player dashboard.

Notes:
  - Preview URL is used (published URL does not exist yet).
  - Email domain is NOT yet DNS-verified — Supabase's built-in sender may drop mail
    to mail.tm. If the email never arrives within EMAIL_TIMEOUT, the test reports
    that clearly instead of silently passing.
"""
import asyncio, os, re, secrets, string, time, json
from pathlib import Path
import requests
from playwright.async_api import async_playwright

BASE_URL = "https://id-preview--74d5d86b-6428-4e07-8c5b-c663d82fd606.lovable.app"
MAILTM  = "https://api.mail.tm"
SCREEN  = Path(__file__).parent / "screenshots"
SCREEN.mkdir(parents=True, exist_ok=True)
EMAIL_TIMEOUT = 180  # seconds


def rand(n=8):
    return "".join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(n))


def create_mailtm_inbox():
    dom = requests.get(f"{MAILTM}/domains", timeout=30).json()
    domain = dom["hydra:member"][0]["domain"]
    addr = f"lovable_e2e_{rand()}@{domain}"
    pwd  = rand(16)
    r = requests.post(f"{MAILTM}/accounts", json={"address": addr, "password": pwd}, timeout=30)
    r.raise_for_status()
    tok = requests.post(f"{MAILTM}/token", json={"address": addr, "password": pwd}, timeout=30).json()["token"]
    return addr, pwd, tok


def poll_confirmation_link(token, deadline):
    hdr = {"Authorization": f"Bearer {token}"}
    while time.time() < deadline:
        msgs = requests.get(f"{MAILTM}/messages", headers=hdr, timeout=30).json().get("hydra:member", [])
        for m in msgs:
            full = requests.get(f"{MAILTM}/messages/{m['id']}", headers=hdr, timeout=30).json()
            html = " ".join(full.get("html") or []) + " " + (full.get("text") or "")
            # Supabase confirm URL patterns
            match = re.search(r'https?://[^\s"<>\']*(?:confirm|verify)[^\s"<>\']*', html, re.I)
            if match:
                return match.group(0)
        time.sleep(5)
    return None


def make_stub_pdf(path):
    # Minimal valid PDF (1 page, blank). Enough to pass a MIME check.
    path.write_bytes(
        b"%PDF-1.1\n1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n"
        b"2 0 obj<< /Type /Pages /Count 1 /Kids [3 0 R] >>endobj\n"
        b"3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >>endobj\n"
        b"xref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n"
        b"0000000053 00000 n \n0000000102 00000 n \ntrailer<< /Size 4 /Root 1 0 R >>\n"
        b"startxref\n165\n%%EOF\n"
    )


async def main():
    email, mail_pwd, mail_tok = create_mailtm_inbox()
    login_pwd = "P@ssw0rd!" + rand(6)
    username  = "e2e" + rand(6)
    print(f"[i] disposable inbox: {email}")
    print(f"[i] username: {username}")

    pdf = SCREEN.parent / "stub_bc.pdf"
    make_stub_pdf(pdf)

    result = {"email": email, "username": username, "steps": {}, "success": False}

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await ctx.new_page()
        console_errs = []
        page.on("console", lambda m: console_errs.append(m.text) if m.type == "error" else None)

        # 1. Load /auth
        await page.goto(f"{BASE_URL}/auth", wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)
        await page.screenshot(path=str(SCREEN / "signup_1_auth_page.png"))
        # Check if a Lovable login gate blocks us
        title = await page.title()
        body_txt = (await page.inner_text("body"))[:300]
        result["steps"]["auth_page_loaded"] = {"title": title, "url": page.url}
        print(f"[i] /auth title: {title}")

        # 2. Switch to Sign Up if we landed on Sign In (default is Sign In)
        try:
            await page.get_by_role("button", name=re.compile(r"^Sign\s*up$", re.I)).first.click(timeout=3000)
        except Exception:
            pass
        await page.wait_for_timeout(500)

        # 3. Fill the form
        try:
            await page.fill('input#name', "E2E Test Player")
            await page.fill('input#username', username)
            await page.fill('input#email', email)
            await page.fill('input#phone', "+8801700000000")
            await page.select_option('select#gender', 'male')
            await page.fill('input#dob', '2000-01-01')
            await page.fill('input#password', login_pwd)
            # Upload stub PDF for birth cert
            file_input = page.locator('input[type="file"]').first
            await file_input.set_input_files(str(pdf))
            # Tick privacy checkbox(es)
            for cb in await page.locator('input[type="checkbox"]').all():
                if not await cb.is_checked():
                    await cb.check()
            await page.wait_for_timeout(1500)  # username availability check
            await page.screenshot(path=str(SCREEN / "signup_2_form_filled.png"))
            result["steps"]["form_filled"] = True
        except Exception as e:
            result["steps"]["form_filled"] = f"FAIL: {e}"
            await page.screenshot(path=str(SCREEN / "signup_2_form_error.png"))
            print(json.dumps(result, indent=2)); await browser.close(); return

        # 4. Submit
        try:
            await page.get_by_role("button", name=re.compile(r"Create account|Sign\s*up", re.I)).click(timeout=5000)
            await page.wait_for_timeout(4000)
            await page.screenshot(path=str(SCREEN / "signup_3_after_submit.png"))
            result["steps"]["submitted"] = {"url": page.url, "body": (await page.inner_text("body"))[:400]}
            print(f"[i] after submit -> {page.url}")
        except Exception as e:
            result["steps"]["submitted"] = f"FAIL: {e}"
            print(json.dumps(result, indent=2)); await browser.close(); return

        # 5. Poll mail.tm for confirmation link
        print(f"[i] polling mail.tm up to {EMAIL_TIMEOUT}s for confirmation email…")
        link = poll_confirmation_link(mail_tok, time.time() + EMAIL_TIMEOUT)
        result["steps"]["confirmation_email"] = link if link else f"NOT RECEIVED within {EMAIL_TIMEOUT}s"
        if not link:
            print("[!] no confirmation email received — likely Supabase default sender did not deliver to mail.tm (email domain not yet DNS-verified)")
            print(json.dumps(result, indent=2)); await browser.close(); return
        print(f"[i] confirm link: {link[:100]}…")

        # 6. Follow confirmation link
        await page.goto(link, wait_until="domcontentloaded")
        await page.wait_for_timeout(4000)
        await page.screenshot(path=str(SCREEN / "signup_4_after_confirm.png"))
        result["steps"]["after_confirm"] = {"url": page.url}
        print(f"[i] landed on: {page.url}")

        # 7. Assert role routing
        landing = page.url
        if "/player" in landing:
            result["success"] = True
            result["steps"]["role_route"] = "PASS: routed to /player"
        elif "/scout" in landing or "/admin" in landing:
            result["steps"]["role_route"] = f"FAIL: wrong role route {landing}"
        else:
            result["steps"]["role_route"] = f"UNKNOWN: {landing}"

        await browser.close()

    print("\n=== RESULT ===")
    print(json.dumps(result, indent=2))
    if console_errs:
        print(f"\nConsole errors ({len(console_errs)}):")
        for e in console_errs[:5]:
            print(" -", e[:200])


if __name__ == "__main__":
    asyncio.run(main())
