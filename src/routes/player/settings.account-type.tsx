import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/account-type")({
  component: () => (
    <ScaffoldPage
      title='Account type and tools'
      description='Switch between account types'
      emptyTitle='Player account'
      emptyText="You're currently using a Player account."
    />
  ),
});
