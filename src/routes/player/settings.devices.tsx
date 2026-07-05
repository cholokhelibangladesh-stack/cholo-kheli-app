import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/devices")({
  component: () => (
    <ScaffoldPage
      title='Device permissions'
      description='Camera, microphone and notifications'
      emptyTitle='Managed by your browser'
      emptyText='These are controlled by your device or browser settings.'
    />
  ),
});
