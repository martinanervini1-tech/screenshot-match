import { caseGuests, nightBriefing } from "./presentation-data";

export const handledSessionKey = "casa-lisboa-night-calls-handled";
export const resolvedCalls = caseGuests.filter((guest) => guest.status === "Booked").slice(0, nightBriefing.resolved).map((guest, index) => ({
  ...guest,
  id: `resolved-${guest.id}`,
  time: ["22:18", "03:45", "04:12"][index] ?? "04:12",
  intent: "Resolved",
  note: ["Check-in instructions confirmed", "Breakfast hours confirmed", "Airport transfer details confirmed"][index] ?? "Guest question answered",
  value: 0,
}));
export type BriefingCall = (typeof nightBriefing.followUps)[number] | (typeof resolvedCalls)[number];

export function briefingSummary(handledIds: readonly string[]) {
  const openCalls = nightBriefing.followUps.filter((call) => !handledIds.includes(call.id));
  return { openCalls, count: openCalls.length, potentialValue: openCalls.reduce((total, call) => total + call.value, 0) };
}
export function parseHandledCalls(value: string | null): string[] {
  try {
    const parsed: unknown = JSON.parse(value ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return nightBriefing.followUps.filter((call) => parsed.includes(call.id)).map((call) => call.id);
  } catch { return []; }
}
export function setCallHandled(ids: readonly string[], callId: string, handled: boolean): string[] {
  if (!nightBriefing.followUps.some((call) => call.id === callId)) return [...ids];
  return handled ? [...new Set([...ids, callId])] : ids.filter((id) => id !== callId);
}