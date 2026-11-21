import { describe, expect, it } from "vitest";
import { briefingSummary, parseHandledCalls, resolvedCalls, setCallHandled } from "@/lib/night-desk/briefing-state";
import { nightBriefing } from "@/lib/night-desk/presentation-data";

describe("Session-local notification follow-ups", () => {
  it("starts at six open follow-ups worth €6,286", () => {
    expect(briefingSummary([]).count).toBe(6);
    expect(briefingSummary([]).potentialValue).toBe(6286);
  });
  it("decreases by one when a follow-up is handled and removes its value", () => {
    const ids = setCallHandled([], "f4", true);
    expect(briefingSummary(ids).count).toBe(5);
    expect(briefingSummary(ids).potentialValue).toBe(4322);
    expect(setCallHandled(ids, "f4", true)).toEqual(["f4"]);
  });
  it("returns zero when all six are handled", () => {
    const ids = nightBriefing.followUps.map((call) => call.id);
    expect(briefingSummary(ids)).toEqual({ openCalls: [], count: 0, potentialValue: 0 });
  });
  it("restores a handled follow-up without changing fictional guest records", () => {
    expect(briefingSummary(setCallHandled(["f4"], "f4", false)).count).toBe(6);
    expect(nightBriefing.followUps.find((call) => call.id === "f4")?.status).toBe("Contacted");
  });
  it("shows nine total calls including three resolved concierge calls", () => {
    expect(nightBriefing.followUps.length + resolvedCalls.length).toBe(9);
    expect(resolvedCalls).toHaveLength(3);
    expect(resolvedCalls.every((call) => call.intent === "Resolved")).toBe(true);
  });
  it("restores only known follow-up IDs and tolerates blocked or corrupt session data", () => {
    expect(parseHandledCalls('["f4","f4","unknown"]')).toEqual(["f4"]);
    expect(parseHandledCalls("broken")).toEqual([]);
    expect(parseHandledCalls(null)).toEqual([]);
    expect(setCallHandled([], "unknown", true)).toEqual([]);
  });
});