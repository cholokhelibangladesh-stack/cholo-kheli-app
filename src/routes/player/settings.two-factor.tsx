import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/two-factor")({
  component: () => (
    <ScaffoldPage
      title="Two-step verification"
      description="Add a second step whenever you sign in on a new device"
      emptyTitle="Two-step verification"
      emptyText="Use an authenticator app or a code sent to your phone to protect your Cholo Kheli account from unauthorised sign-ins."
      eta="Next update"
      points={[
        "Authenticator app (Google Authenticator, 1Password, Authy)",
        "SMS backup code delivery",
        "Trusted device list you can revoke at any time",
      ]}
    />
  ),
});
