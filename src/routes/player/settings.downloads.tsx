import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/downloads")({
  component: () => (
    <ScaffoldPage
      title='Archiving and downloading'
      description='Archive uploads or download your data'
      emptyTitle='No downloads requested'
      emptyText='Request a download of your account data at any time.'
    />
  ),
});
