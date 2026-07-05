import { createFileRoute } from "@tanstack/react-router";
import UserRelationPage from "@/pages/settings/UserRelationPage";
export const Route = createFileRoute("/player/settings/muted")({
  component: () => (
    <UserRelationPage
      title="Muted accounts"
      description="You won't see their posts in your feed"
      emptyText="Mute an account to stop seeing their posts."
      table="muted_users"
      ownerColumn="user_id"
      targetColumn="muted_id"
      addLabel="Mute"
      removeLabel="Unmute"
    />
  ),
});
