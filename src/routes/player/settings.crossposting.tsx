import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/crossposting")({
  component: () => (
    <ScaffoldPage
      title='Crossposting'
      description='Post to other social accounts'
      emptyTitle='No connected accounts'
      emptyText='Connect a social account to crosspost your uploads.'
    />
  ),
});
