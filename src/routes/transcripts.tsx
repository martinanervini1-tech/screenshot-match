import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/transcripts")({
  beforeLoad: () => { throw redirect({ to: "/inquiries" }); },
  head: () => ({
    meta: [
      { title: "Guest conversations | Casa Lisboa" },
      {
        name: "description",
        content: "Search Casa Lisboa concierge transcripts and the guest inquiries they created.",
      },
      { property: "og:title", content: "Guest conversations | Casa Lisboa" },
      {
        property: "og:description",
        content: "Every guest has a story. Explore Casa Lisboa concierge conversations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
