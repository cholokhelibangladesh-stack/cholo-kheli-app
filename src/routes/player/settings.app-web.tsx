import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/app-web")({
  component: () => (
    <ScaffoldPage
      title='App website permissions'
      description='Sites and apps connected to your account'
      emptyTitle='No connected apps'
      emptyText='No third-party apps are connected to your account.'
    />
  ),
});
