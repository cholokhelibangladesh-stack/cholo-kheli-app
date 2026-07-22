import { Outlet, createRootRouteWithContext, HeadContent, Scripts, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";


import type { QueryClient } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import FloatingHeader from "@/components/FloatingHeader";
import SiteFooter from "@/components/SiteFooter";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { reportError } from "@/lib/errors";
import appCss from "@/index.css?url";
import logoMark from "@/assets/cholo-kheli-mark.png.asset.json";
import AppFrame from "@/components/app/AppFrame";
import { useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import BanGuard from "@/components/BanGuard";
import GlobalDragScroll from "@/components/GlobalDragScroll";

const APP_PREFIXES = ["/player", "/scout", "/admin", "/resume"];
function useInAppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  return !!user && APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function RootRouteError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    reportError(error, { boundary: "root_route" });
  }, [error]);

  return (
    <RootDocument>
      <div role="alert" className="min-h-screen flex items-center justify-center bg-background px-6 text-foreground">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight">This page couldn't load</h1>
          <p className="text-muted-foreground">
            We hit an unexpected problem loading Cholo Kheli. Please try again.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                router.invalidate();
                reset();
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Try again
            </button>
            <a
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    </RootDocument>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cholo Kheli — Bangladesh Sports, Digitised" },
      { name: "description", content: "Cholo Kheli connects Bangladesh's grassroots talent with verified scouts. Safe, transparent, beautifully simple." },
      { property: "og:title", content: "Cholo Kheli — Bangladesh Sports, Digitised" },
      { property: "og:description", content: "Cholo Kheli connects Bangladesh's grassroots talent with verified scouts. Safe, transparent, beautifully simple." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Cholo Kheli" },
      { name: "theme-color", content: "#0a0a0a" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&display=swap" },
      { rel: "stylesheet", href: appCss },
      // Preload the intro logo mark so the loading screen paints
      // instantly on first paint.
      { rel: "preload", href: logoMark.url, as: "image", type: "image/png" },

    ],
  }),
  errorComponent: RootRouteError,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <AppErrorBoundary>
        <AppShell />
      </AppErrorBoundary>
    </RootDocument>
  );
}

function AppShell() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BanGuard />
            <ShellRouter />
            <GlobalDragScroll />
            <CookieConsentBanner />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

/**
 * Chooses between the marketing shell (FloatingHeader + SiteFooter) and
 * the app-style shell (AppFrame with header + bottom tab bar). Keeps all
 * existing routes unchanged — only the outer chrome swaps.
 */
function ShellRouter() {
  const inApp = useInAppShell();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Mobile app intro/auth routes render without web chrome.
  const isAppIntro = pathname === "/" || pathname.startsWith("/auth");
  if (inApp) {
    return (
      <AppFrame>
        <main id="main">
          <Outlet />
        </main>
      </AppFrame>
    );
  }
  if (isAppIntro) {
    return (
      <main id="main">
        <Outlet />
      </main>
    );
  }
  return (
    <>
      <FloatingHeader />
      <main id="main">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}


function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "globalThis.__name=globalThis.__name||((fn)=>fn)",
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html:
              "html{background:#030303;color-scheme:dark}html:not(.dark){background:#d6dee2;color-scheme:light}body{margin:0;background:inherit;color:hsl(var(--foreground));overflow-x:hidden}#ck-boot-screen{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:#030303;color:#eaf7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}#ck-boot-screen>div{display:grid;place-items:center;gap:18px;text-align:center}#ck-boot-screen img{width:76px;height:76px;object-fit:contain;filter:drop-shadow(0 10px 26px rgba(0,0,0,.42))}#ck-boot-screen strong{display:block;font-size:13px;letter-spacing:.34em;text-transform:uppercase}#ck-boot-screen span{display:block;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(234,247,251,.68)}@media (prefers-reduced-motion:no-preference){#ck-boot-screen img{animation:ckBootPulse 1.15s ease-in-out infinite alternate}@keyframes ckBootPulse{from{transform:scale(.96);opacity:.72}to{transform:scale(1);opacity:1}}}",
          }}
        />
        <HeadContent />
      </head>
      <body>
        <BootScreen />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function BootScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(false));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!visible) return null;

  return (
    <div id="ck-boot-screen" aria-label="Opening Cholo Kheli" role="status">
      <div>
        <img src={logoMark.url} alt="" aria-hidden="true" />
        <p>
          <strong>Cholo Kheli</strong>
          <span>Let&apos;s play</span>
        </p>
      </div>
    </div>
  );
}
