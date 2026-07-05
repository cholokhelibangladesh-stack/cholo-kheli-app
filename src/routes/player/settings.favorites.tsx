import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/favorites")({
  component: () => (
    <ScaffoldPage
      title='Favorites'
      description='Prioritise videos from favourite accounts'
      emptyTitle='No favourites yet'
      emptyText='Add favourites to see their new videos at the top of your feed.'
    />
  ),
});
