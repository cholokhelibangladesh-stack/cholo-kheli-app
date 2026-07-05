import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/password")({
  component: () => (
    <ScaffoldPage
      title="Password and passkeys"
      description="Change your password or manage sign-in passkeys for this account."
      emptyTitle="Password tools coming next"
      emptyText="You'll be able to change your password and add passkeys right here."
    />
  ),
});
