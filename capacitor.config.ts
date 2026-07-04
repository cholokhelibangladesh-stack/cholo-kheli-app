import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cholokheli.app",
  appName: "Cholo Kheli",
  webDir: "dist",
  // For development on a physical device against the live Lovable preview,
  // keep `server.url` pointing at your preview URL. For a production build
  // that ships the bundled `dist/`, comment this block out and run
  // `bun run build && npx cap sync`.
  server: {
    url: "https://id-preview--74d5d86b-6428-4e07-8c5b-c663d82fd606.lovable.app",
    cleartext: true,
  },
  ios: {
    contentInset: "always",
  },
  android: {
    backgroundColor: "#0a0a0a",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#0a0a0a",
      showSpinner: false,
    },
    Keyboard: {
      resize: "native",
    },
  },
};

export default config;
