import { createFileRoute } from "@tanstack/react-router";
import UserRelationPage from "@/pages/settings/UserRelationPage";
export const Route = createFileRoute("/player/settings/close-friends")({
  component: () => (
    <UserRelationPage
      title="Close Friends"
      description="Share close-friends-only content with a smaller group"
      emptyText="Add close friends so only they see your close-friends-only content."
      table="close_friends"
      ownerColumn="user_id"
      targetColumn="friend_id"
      addLabel="Add"
      removeLabel="Remove"
    />
  ),
});
