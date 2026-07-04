# Building the Cholo Kheli mobile app (Capacitor)

The web app is now wrapped as a native iOS + Android app via
[Capacitor](https://capacitorjs.com). You build the actual binaries on your
own Mac (iOS) or any machine with Android Studio (Android).

## One-time setup (per platform)

Clone the repo locally, then:

```bash
bun install
bun run build              # produces dist/
npx cap add ios            # requires macOS + Xcode
npx cap add android        # requires Android Studio + JDK 17
```

## Dev loop against the live Lovable preview

`capacitor.config.ts` currently points `server.url` at the Lovable preview
URL, so installing the app on a device gives you instant hot-reload:

```bash
npx cap sync
npx cap open ios       # then Run in Xcode
npx cap open android   # then Run in Android Studio
```

## Production build (ship a real bundled app)

1. Open `capacitor.config.ts` and delete the `server` block.
2. `bun run build && npx cap sync`
3. In Xcode / Android Studio, archive & sign for the App Store / Play Store
   the normal way.

## Notes
- App id: `com.cholokheli.app` — change in `capacitor.config.ts` before your
  first store submission if you want a different bundle id.
- Splash & status bar: initialised from `src/lib/native.ts` on launch.
- Hardware back button (Android): mapped to router history; exits when at
  root.
