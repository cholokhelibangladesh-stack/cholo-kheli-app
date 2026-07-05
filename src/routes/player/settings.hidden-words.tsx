import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/hidden-words")({
  component: () => (
    <ScaffoldPage
      title='Hidden Words'
      description='Hide comments and messages with certain words'
      emptyTitle='No hidden words'
      emptyText='Add words to automatically hide comments and messages.'
    />
  ),
});
