import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/accessibility")({
  component: () => (
    <ScaffoldPage
      title='Accessibility'
      description='Captions, motion and screen reader'
      emptyTitle='Using system defaults'
      emptyText='Adjust motion and captions to suit your needs.'
    />
  ),
});
