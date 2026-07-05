import { createFileRoute } from "@tanstack/react-router";
import UserRelationPage from "@/pages/settings/UserRelationPage";
export const Route = createFileRoute("/player/settings/restricted")({
  component: () => (
    <UserRelationPage
      title="Restricted"
      description="Their comments will only be visible to them, unless you approve"
      emptyText="Restrict someone to hide their comments from others without blocking them."
      table="restricted_users"
      ownerColumn="user_id"
      targetColumn="restricted_id"
      addLabel="Restrict"
      removeLabel="Unrestrict"
    />
  ),
});
