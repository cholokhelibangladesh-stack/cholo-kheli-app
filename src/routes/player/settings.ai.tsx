import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/ai")({
  component: () => (
    <ScaffoldPage
      title="Cholo Kheli AI assistant"
      description="Feedback and drills tailored to your uploads"
      emptyTitle="AI-powered feedback"
      emptyText="Get automatic tags on each highlight, drill suggestions based on your position, and readable notes you can share with your coach."
      eta="Rolling out to verified players first"
      points={[
        "Auto-tags positions and traits in your videos",
        "Weekly drills matched to what your uploads show",
        "Plain-English notes you can send your coach",
      ]}
    />
  ),
});
