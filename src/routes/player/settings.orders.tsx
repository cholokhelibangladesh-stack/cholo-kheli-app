import { createFileRoute } from "@tanstack/react-router";
import OrdersPage from "@/pages/settings/OrdersPage";
export const Route = createFileRoute("/player/settings/orders")({ component: OrdersPage });
