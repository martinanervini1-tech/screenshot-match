import type { Database } from "@/integrations/supabase/types";
export type Inquiry = Database["public"]["Tables"]["inquiries"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type DeskData = { inquiries: Inquiry[]; bookings: Booking[] };
export type Message = { speaker: string; text: string; timestamp: string };
export function transcriptMessages(value: Inquiry["transcript"]): Message[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((m) =>
    m &&
    typeof m === "object" &&
    !Array.isArray(m) &&
    typeof m["speaker"] === "string" &&
    typeof m["text"] === "string"
      ? [
          {
            speaker: m["speaker"],
            text: m["text"],
            timestamp: typeof m["timestamp"] === "string" ? m["timestamp"] : "",
          },
        ]
      : [],
  );
}
export const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Lisbon",
  }).format(new Date(iso));
export const time = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Lisbon",
  }).format(new Date(iso));
export const initials = (name: string) =>
  name
    .split(" ")
    .filter((x) => x !== "&")
    .map((x) => x[0])
    .slice(0, 2)
    .join("");
export function prioritized(inquiries: Inquiry[]) {
  const scores: Record<string, number> = { hot: 0, warm: 1, cold: 2 };
  return inquiries
    .filter((i) => i.status === "new" || i.status === "contacted")
    .sort(
      (a, b) =>
        (scores[a.priority] ?? 3) - (scores[b.priority] ?? 3) ||
        b.estimated_value - a.estimated_value,
    );
}
