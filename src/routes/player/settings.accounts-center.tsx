import { createFileRoute } from "@tanstack/react-router";
import AccountSettings from "@/pages/AccountSettings";
export const Route = createFileRoute("/player/settings/accounts-center")({
  component: AccountSettings,
});
