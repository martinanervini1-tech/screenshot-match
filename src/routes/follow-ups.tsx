import { createFileRoute } from "@tanstack/react-router";
import { FollowUpsPresentation } from "@/components/night-desk/presentation-views";
export const Route = createFileRoute("/follow-ups")({
  validateSearch: (search: Record<string, unknown>): { call?: string } => typeof search["call"] === "string" ? { call: search["call"] } : {},
  head: () => ({ meta: [
    { title: "Morning follow-ups | Casa Lisboa Night Desk" },
    { name: "description", content: "Six fictional Casa Lisboa guest follow-ups, their stays, requirements and morning call deadlines." },
    { property: "og:title", content: "Morning follow-ups | Casa Lisboa Night Desk" },
    { property: "og:description", content: "Casa Lisboa’s six morning follow-ups and €6,286 in potential stays." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: FollowUpsPage,
});
function FollowUpsPage() {
  const { call } = Route.useSearch();
  return <FollowUpsPresentation selectedCall={call ?? ""} />;
}