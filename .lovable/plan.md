# Mobile Native App (Capacitor) + Fresh Mobile UI

## Goals
- Ship an iOS/Android app of Cholo Kheli via Capacitor, wrapping the existing web app.
- Rebuild the shell for a real "app feel": bottom tab bar, stack-style screens, safe-area handling, mobile-only layouts. Keep all existing business logic (auth, uploads, scouting, admin, i18n).

## Scope

### 1. Capacitor integration
- Add packages: `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`, `@capacitor/status-bar`, `@capacitor/splash-screen`, `@capacitor/app`, `@capacitor/haptics`, `@capacitor/keyboard`.
- Create `capacitor.config.ts` with `appId: com.cholokheli.app`, `appName: Cholo Kheli`, `webDir: dist`, dev-server URL pointing at the Lovable preview so users can hot-reload on device.
- Add `src/lib/native.ts`: initialize StatusBar (dark content on teal), SplashScreen.hide, hardware back-button handler that maps to router history, keyboard resize behavior.
- Wire `initNative()` into `src/routes/__root.tsx` (runs only when `Capacitor.isNativePlatform()`).
- Add README section: how to `bun run build`, `npx cap add ios/android`, `npx cap sync`, and open in Xcode / Android Studio to build the binary. (Actual signing/store submission is on the user's Mac / Android Studio — cannot run in sandbox.)

### 2. Fresh mobile app shell
- New `src/components/app/AppShell.tsx`: full-viewport flex column with `pt-[env(safe-area-inset-top)]` header, scrollable `<Outlet />`, persistent `AppTabBar` docked to bottom with safe-area padding.
- New `src/components/app/AppTabBar.tsx`: role-aware 4-tab bar (Home, Explore, Upload/Selections, Profile) with active indicator, haptic tap feedback on native, replaces `MobileBottomNav`.
- New `src/components/app/AppHeader.tsx`: compact top bar (logo left, notifications + language switch right, contextual back button when not at a tab root).
- New `src/components/app/ScreenTransition.tsx`: framer-motion slide/fade wrapper so route changes feel like a native stack.
- Force mobile viewport: root layout constrained to `max-w-[430px] mx-auto` on desktop preview so the app always looks phone-shaped; full width on real device.
- Hide the current marketing `Navbar` and desktop-oriented pieces when inside the app shell (auth'd routes). Keep marketing pages (`/`, `/mission`, `/faq`, `/safe-scouting`) reachable but restyled mobile-first.

### 3. Route restructure
- Introduce a pathless layout `src/routes/_app.tsx` that renders `AppShell`.
- Move authenticated screens under it: `_app/home.tsx`, `_app/explore.tsx`, `_app/upload.tsx`, `_app/profile.tsx`, `_app/selections.tsx`, `_app/settings.tsx`. These reuse existing page components from `src/pages/*` — no business-logic rewrite.
- Keep existing top-level routes for auth, reset-password, marketing, admin.
- Update `useAuth` role redirects to point at the new `_app/*` paths.

### 4. Mobile-first polish
- Convert primary CTAs to full-width, 48px tap targets.
- Replace hover-only interactions with tap/press states.
- Tighten typography scale for phone (base 15px, headings clamp).
- Add pull-to-refresh on Explore feed (framer-motion + touch handlers, no extra dep).
- Set preview viewport to mobile.

## Out of scope (this pass)
- Push notifications (would need FCM/APNs setup + secrets).
- Native camera capture for uploads (keeps current file picker; can add `@capacitor/camera` next).
- App Store / Play Store submission — user handles on their machine.
- Changing existing DB, RLS, auth flows, or admin logic.

## Technical notes
- Capacitor's `server.url` in `capacitor.config.ts` will point at the preview URL so the installed app hot-reloads during development; for production build, remove that field and it uses the bundled `dist/`.
- Native init lives behind `Capacitor.isNativePlatform()` so web preview is unaffected.
- `AppShell` uses `100dvh` + safe-area env vars so it behaves correctly on iOS notch / Android gesture bar.
- Existing `MobileBottomNav` will be deleted once `AppTabBar` replaces it.

## Deliverable per turn
This is one plan; on approval I'll implement it in a single pass and report back with the Capacitor CLI commands you need to run on your Mac/PC to produce the iOS/Android binaries.
