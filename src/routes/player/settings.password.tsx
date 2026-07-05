import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/password")({
  component: () => (
    <ScaffoldPage
      title="Password and passkeys"
      description="Sign-in credentials for your account"
      emptyTitle="Password tools land here"
      emptyText="Rotate your password or register a device passkey without leaving the app."
      eta="Next update"
      points={[
        "Change your password with the old one",
        "Reset via a link sent to your email",
        "Register a passkey on this device for one-tap sign-in",
      ]}
    />
  ),
});
