import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/verified")({
  component: () => (
    <ScaffoldPage
      title="Cholo Kheli Verified"
      description="Blue check for players with confirmed identity and achievements"
      emptyTitle="Verification application"
      emptyText="Submit your NID, playing record, and any federation affiliation. Our team reviews within seven days."
      eta="Application flow opens next release"
      points={[
        "Confirms your real identity to scouts",
        "Priority ranking in Explore for verified players",
        "Access to invite-only trials from federated clubs",
      ]}
    />
  ),
});
