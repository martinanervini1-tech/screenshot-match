import { createFileRoute } from "@tanstack/react-router";
import { demoDeskOptions } from "@/lib/night-desk/queries";
import { AnalyticsPage } from "@/components/night-desk/analytics";
export const Route = createFileRoute("/analytics")({
  loader: ({ context }) => context.queryClient.ensureQueryData(demoDeskOptions),
  head: () => ({
    meta: [
      { title: "Hotel analytics | Casa Lisboa" },
      {
        name: "description",
        content:
          "Track reservation channels, concierge revenue, guest preferences, and housekeeping at Casa Lisboa.",
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
  component: AnalyticsPage,
});
