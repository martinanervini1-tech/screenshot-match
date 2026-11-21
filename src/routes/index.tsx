import { createFileRoute } from "@tanstack/react-router";
import { demoDeskOptions } from "@/lib/night-desk/queries";
import { MorningDesk } from "@/components/night-desk/morning";
export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(demoDeskOptions),
  head: () => ({
    meta: [
      { title: "Morning Desk | Casa Lisboa" },
      {
        name: "description",
        content:
          "Casa Lisboa’s overnight guest inquiries, priority follow-ups, and direct-booking opportunities.",
      },
      { property: "og:title", content: "Morning Desk | Casa Lisboa" },
      {
        property: "og:description",
        content: "A thoughtful start to the day: guests, stays, and next steps at Casa Lisboa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MorningDesk,
});
