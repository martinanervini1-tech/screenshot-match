import { createFileRoute } from "@tanstack/react-router";
import { InquiriesPresentation } from "@/components/night-desk/presentation-views";
export const Route = createFileRoute("/inquiries")({
  head: () => ({ meta: [
    { title: "All inquiries | Casa Lisboa Night Desk" },
    { name: "description", content: "94 fictional concierge inquiries at Casa Lisboa over the last 30 days, with stays, quotes and outcomes." },
    { property: "og:title", content: "All inquiries | Casa Lisboa Night Desk" },
    { property: "og:description", content: "Casa Lisboa’s 94 inquiries: 41 booked, 14 new, 13 contacted and 26 lost." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: InquiriesPresentation,
});