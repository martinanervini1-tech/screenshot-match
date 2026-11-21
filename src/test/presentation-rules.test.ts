import { describe, expect, it } from "vitest";
import { briefingDelay, caseGuests, commissionSaved, followUps, metrics, nightBriefing, statusCounts, weeks } from "@/lib/night-desk/presentation-data";

describe("Casa Lisboa fictional presentation", () => {
  it("waits 800ms before the automatic morning briefing", () => {
    expect(briefingDelay).toBe(800);
  });
  it("shares nine calls, six follow-ups and €6,286 with the last-night strip", () => {
    expect(nightBriefing.calls).toBe(9);
    expect(nightBriefing.followUps).toHaveLength(6);
    expect(nightBriefing.potentialValue).toBe(6286);
    expect(nightBriefing.followUps.reduce((sum, guest) => sum + guest.value, 0)).toBe(nightBriefing.potentialValue);
    expect(nightBriefing.resolved).toBe(3);
  });
  it("orders briefing follow-ups by potential value, highest first, preserving call IDs", () => {
    expect(nightBriefing.followUps.map((guest) => guest.value)).toEqual([1964, 1338, 1075, 742, 711, 456]);
    expect(nightBriefing.followUps.map((guest) => guest.id)).toEqual(["f4", "f5", "f1", "f2", "f3", "f6"]);
  });
  it("has exactly 94 inquiries split 14 New, 13 Contacted, 41 Booked and 26 Lost", () => {
    expect(statusCounts).toEqual({ All: 94, New: 14, Contacted: 13, Booked: 41, Lost: 26 });
  });
  it("has 71 after-hours calls, rounded to 76%", () => {
    expect(metrics.afterHours).toBe(71);
    expect(Math.round(metrics.afterHours / metrics.calls * 100)).toBe(76);
  });
  it("has €38,642 booked and €6,956 saved at 18%", () => {
    expect(metrics.revenue).toBe(38642);
    expect(commissionSaved).toBe(6956);
  });
  it("has €24,318 at risk across 27 open inquiries", () => {
    expect(metrics.risk).toBe(24318);
    expect(statusCounts.New + statusCounts.Contacted).toBe(27);
  });
  it("has six open morning follow-ups totaling €6,286 with the specified quotes", () => {
    expect(followUps.map((g) => [g.name, g.value, g.deadline])).toEqual([
      ["Hannah Whitfield", 1075, "11:00"], ["Alexander Weber", 742, "10:00"],
      ["Lauren & Mike Ostrowski", 711, "10:30"], ["Kenji Morimoto", 1964, "11:30"],
      ["Aoife Brennan", 1338, "12:00"], ["Rafael Duarte", 456, "12:00"],
    ]);
    expect(metrics.followUpValue).toBe(6286);
    expect(followUps.every((g) => g.status === "New" || g.status === "Contacted")).toBe(true);
  });
  it("uses weekly calls 21/28/19/26, bookings 9/13/7/12 and revenues 8214/12906/5377/12145", () => {
    expect(weeks.map((w) => [w.calls, w.bookings, w.revenue])).toEqual([[21,9,8214],[28,13,12906],[19,7,5377],[26,12,12145]]);
    expect(weeks.reduce((s,w) => s + w.calls, 0)).toBe(metrics.calls);
    expect(weeks.reduce((s,w) => s + w.bookings, 0)).toBe(statusCounts.Booked);
    expect(weeks.reduce((s,w) => s + w.revenue, 0)).toBe(metrics.revenue);
  });
  it("includes the W2 nine-night Rooftop Suite worth €4,860", () => {
    expect(caseGuests.some((g) => g.status === "Booked" && g.room === "Rooftop Suite" && g.nights === 9 && g.value === 4860)).toBe(true);
  });
  it("keeps nightly presentation quotes in the requested room ranges", () => {
    const ranges: Record<string, [number, number]> = { "Classic Double": [148, 152], "Superior Balcony": [190, 238], "Family Suite": [265, 270], "Rooftop Suite": [325, 540] };
    for (const guest of caseGuests) {
      const range = ranges[guest.room];
      expect(range).toBeDefined();
      if (!range) continue;
      expect(guest.value / guest.nights).toBeGreaterThanOrEqual(range[0]);
      expect(guest.value / guest.nights).toBeLessThanOrEqual(range[1]);
    }
  });
});