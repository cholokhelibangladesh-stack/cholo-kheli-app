import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/invite")({
  component: () => (
    <ScaffoldPage
      title="Invite teammates"
      description="Bring your club or academy onto Cholo Kheli"
      emptyTitle="Send a personal invite"
      emptyText="Generate a share link tied to your profile so scouts know who invited each new player."
      eta="Soon"
      points={[
        "Personal invite link with your username",
        "Track how many players joined through your invites",
        "Bulk invite by email or phone number",
      ]}
    />
  ),
});
