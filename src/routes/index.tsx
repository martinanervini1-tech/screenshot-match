import { createFileRoute } from "@tanstack/react-router";
import { OverviewPresentation } from "@/components/night-desk/presentation-views";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview | Casa Lisboa Night Desk" },
      {
        name: "description",
        content:
          "Casa Lisboa’s overnight guest inquiries, priority follow-ups, and direct-booking opportunities.",
      },
      { property: "og:title", content: "Overview | Casa Lisboa Night Desk" },
      {
        property: "og:description",
        content: "A thoughtful start to the day: guests, stays, and next steps at Casa Lisboa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OverviewPresentation,
});
