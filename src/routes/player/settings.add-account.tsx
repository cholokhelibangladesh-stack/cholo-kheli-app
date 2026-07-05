import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/add-account")({
  component: () => (
    <ScaffoldPage
      title='Add account'
      description='Sign in to a second account'
      emptyTitle='One account per session'
      emptyText='To switch, log out and sign in with another account.'
    />
  ),
});
