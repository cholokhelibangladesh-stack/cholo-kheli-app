import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/orders")({
  component: () => (
    <ScaffoldPage
      title='Orders and payments'
      description='Your subscriptions, invoices and payouts'
      emptyTitle='No orders yet'
      emptyText='Your purchase history will appear here.'
    />
  ),
});
