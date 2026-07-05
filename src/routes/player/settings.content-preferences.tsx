import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/content-preferences")({
  component: () => (
    <ScaffoldPage
      title='Content preferences'
      description='Fine-tune what you see'
      emptyTitle='Using default preferences'
      emptyText='Cholo Kheli tailors your feed automatically.'
    />
  ),
});
