import { createFileRoute } from "@tanstack/react-router";
import FavoritesPage from "@/pages/settings/FavoritesPage";
export const Route = createFileRoute("/player/settings/favorites")({ component: FavoritesPage });
