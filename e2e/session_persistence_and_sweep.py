#!/usr/bin/env python3
"""
Two things in one run:

1) Session persistence: sign in as each seeded role, save the browser
   storage_state, close the browser, reopen a fresh browser with the same
   storage_state, hit "/", and verify the app lands on the correct role
   dashboard without bouncing to /auth.

   This is the closest local proxy for the user flow "sign up, close the
   app, reopen it, land on the homepage". True email-confirm signup is
   skipped because it needs an inbox — seeded accounts cover the auth
   session persistence path that governs the reopen behavior.

2) Mobile-viewport screenshot sweep at 390x844 for every main route,
   authenticated as the appropriate role. Screenshots land in
   e2e/screenshots/sweep_*.png so a human (or a follow-up pass) can eyeball
   overflow / cropping / misalignment.

Usage:
    python3 e2e/session_persistence_and_sweep.py
"""
import asyncio, os, sys, json
from pathlib import Path
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:8080").rstrip("/")
OUT = Path(__file__).parent / "screenshots"
OUT.mkdir(parents=True, exist_ok=True)
STATE_DIR = Path(__file__).parent / ".state"
STATE_DIR.mkdir(parents=True, exist_ok=True)

VIEWPORT = {"width": 390, "height": 844}

ACCOUNTS = [
    dict(role="player", email="player-test@cholokheli.test", password="PlayerTest#2026", dashboard="/player"),
    dict(role="scout",  email="scout-test@cholokheli.test",  password="ScoutTest#2026",  dashboard="/scout"),
    dict(role="admin",  email="admin-test@cholokheli.test",  password="AdminTest#2026",  dashboard="/admin"),
]

PUBLIC_ROUTES = ["/", "/auth", "/mission", "/safe-scouting", "/faq", "/privacy-policy"]
ROLE_ROUTES = {
    "player": ["/player", "/player/explore", "/player/upload", "/player/profile", "/player/settings"],
    "scout":  ["/scout", "/scout/explore", "/scout/selections", "/scout/inbox", "/scout/profile", "/scout/settings"],
    "admin":  ["/admin", "/admin/panel", "/admin/moderation", "/admin/users", "/admin/videos", "/admin/reports", "/admin/settings"],
}
PUBLIC_EXTRA = ["/blocked"]

results = []
def rec(name, ok, detail=""):
    results.append((name, ok, detail))
    print(f"[{'PASS' if ok else 'FAIL'}] {name}" + (f" — {detail}" if detail else ""))


async def sign_in(page, email, password):
    await page.goto(BASE + "/auth", wait_until="domcontentloaded")
    await page.wait_for_timeout(1500)
    await page.fill("#email", email)
    await page.fill("#password", password)
    # Exact match — "Sign In" (login) vs "Sign Up" (toggle) collide otherwise.
    await page.get_by_role("button", name="Sign In", exact=True).click()
    await page.wait_for_timeout(4000)



async def check_overflow(page):
    """Returns list of elements whose scrollWidth > viewport width (horizontal overflow)."""
    return await page.evaluate("""() => {
        const vw = window.innerWidth;
        const bad = [];
        document.querySelectorAll('*').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.width > vw + 2 || r.right > vw + 2) {
                const tag = el.tagName.toLowerCase();
                const cls = (el.className && el.className.toString().slice(0, 60)) || '';
                bad.push(`${tag}.${cls} w=${Math.round(r.width)} right=${Math.round(r.right)}`);
            }
        });
        // dedupe & cap
        return [...new Set(bad)].slice(0, 8);
    }""")


async def main():
    async with async_playwright() as p:
        # ---- Sweep public routes (no auth) ----
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport=VIEWPORT)
        page = await ctx.new_page()
        for route in PUBLIC_ROUTES:
            try:
                await page.goto(BASE + route, wait_until="domcontentloaded", timeout=15000)
                await page.wait_for_timeout(900)
                shot = OUT / f"sweep_public_{route.strip('/').replace('/', '_') or 'root'}.png"
                await page.screenshot(path=str(shot))
                overflow = await check_overflow(page)
                rec(f"sweep public {route}", not overflow,
                    ("overflow: " + "; ".join(overflow)) if overflow else "ok")
            except Exception as e:
                rec(f"sweep public {route}", False, str(e))
        await browser.close()

        # ---- Per-role: sign in, save state, sweep, then verify reopen ----
        for acc in ACCOUNTS:
            role = acc["role"]
            state_path = STATE_DIR / f"{role}.json"

            # Sign in and save storage state
            browser = await p.chromium.launch(headless=True)
            ctx = await browser.new_context(viewport=VIEWPORT)
            page = await ctx.new_page()
            try:
                await sign_in(page, acc["email"], acc["password"])
                await page.goto(BASE + acc["dashboard"], wait_until="domcontentloaded")
                await page.wait_for_timeout(1500)
                # Save state IMMEDIATELY after login — before sweep can perturb the session.
                await ctx.storage_state(path=str(state_path))
                # Sweep authed role routes
                for route in ROLE_ROUTES[role]:
                    try:
                        await page.goto(BASE + route, wait_until="domcontentloaded", timeout=15000)
                        await page.wait_for_timeout(1000)
                        shot = OUT / f"sweep_{role}_{route.strip('/').replace('/', '_')}.png"
                        await page.screenshot(path=str(shot))
                        overflow = await check_overflow(page)
                        rec(f"sweep {role} {route}", not overflow,
                            ("overflow: " + "; ".join(overflow)) if overflow else "ok")
                    except Exception as e:
                        rec(f"sweep {role} {route}", False, str(e))
            finally:
                await browser.close()


            # Reopen with saved state — verify landing behavior
            browser = await p.chromium.launch(headless=True)
            ctx = await browser.new_context(viewport=VIEWPORT, storage_state=str(state_path))
            page = await ctx.new_page()
            try:
                await page.goto(BASE + "/", wait_until="domcontentloaded", timeout=15000)
                # Wait for auth-driven redirect
                await page.wait_for_timeout(6000)
                final = page.url
                ok = acc["dashboard"] in final
                await page.screenshot(path=str(OUT / f"reopen_{role}.png"))
                rec(f"reopen {role} → {acc['dashboard']}", ok, f"final={final}")
            except Exception as e:
                rec(f"reopen {role}", False, str(e))
            finally:
                await browser.close()

    fails = [r for r in results if not r[1]]
    print(f"\n{'='*60}\n{len(results) - len(fails)} passed, {len(fails)} failed")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    asyncio.run(main())
