import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/restricted")({
  component: () => (
    <ScaffoldPage
      title='Restricted'
      description='Limit an account without blocking them'
      emptyTitle='No restricted accounts'
      emptyText='Restrict someone to hide their comments from others.'
    />
  ),
});
