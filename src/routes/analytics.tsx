import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsPresentation } from "@/components/night-desk/presentation-views";
export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Hotel analytics | Casa Lisboa" },
      {
        name: "description",
        content:
          "Casa Lisboa’s last 30 days: weekly calls, direct bookings, concierge revenue and inquiry outcomes.",
      },
      { property: "og:title", content: "Hotel analytics | Casa Lisboa" },
      {
        property: "og:description",
        content:
          "Meaningful insights for a small hotel: direct bookings, commissions, and guest preferences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPresentation,
});
