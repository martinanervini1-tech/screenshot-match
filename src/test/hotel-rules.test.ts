import { describe, it, expect } from "vitest";
import { priceStay, commission, afterHours, housekeeping } from "@/lib/night-desk/pricing";
import { prepareInquiry } from "@/lib/night-desk/ingestion";
describe("Casa Lisboa hotel rules", () => {
  for (const [room, rate] of [
    ["Classic Double", 140],
    ["Superior Balcony", 185],
    ["Family Suite", 260],
    ["Rooftop Suite", 340],
  ] as const)
    it(`${room} winter rate`, () =>
      expect(priceStay(room, "2026-11-21", "2026-11-22").total).toBe(rate));
  it("May anniversary quote is €711", () =>
    expect(
      priceStay("Superior Balcony", "2027-05-14", "2027-05-17", ["Celebration package"]).total,
    ).toBe(711));
  it("season applies per night across March and April", () =>
    expect(priceStay("Classic Double", "2027-03-31", "2027-04-02").total).toBe(308));
  it("airport transfer is €35", () =>
    expect(
      priceStay("Classic Double", "2026-11-21", "2026-11-22", ["Airport transfer"]).extraTotal,
    ).toBe(35));
  it("late checkout is €30", () =>
    expect(
      priceStay("Classic Double", "2026-11-21", "2026-11-22", ["Late check-out"]).extraTotal,
    ).toBe(30));
  it("bikes are €15 each day", () =>
    expect(
      priceStay("Classic Double", "2026-11-21", "2026-11-24", ["Bike rental"]).extraTotal,
    ).toBe(45));
  it("cot is complimentary", () =>
    expect(priceStay("Family Suite", "2026-11-21", "2026-11-22", ["Baby cot"]).extraTotal).toBe(0));
  it("third-party commission is 18%", () =>
    expect(commission(711, "Booking.com").cost).toBe(127.98));
  it("direct bookings pay no commission", () =>
    expect(commission(711, "voice agent").cost).toBe(0));
  it("office opens at 09 and closes at 18 Lisbon time", () => {
    expect(afterHours("2026-11-21T08:59:00Z")).toBe(true);
    expect(afterHours("2026-11-21T09:00:00Z")).toBe(false);
    expect(afterHours("2026-11-21T18:00:00Z")).toBe(true);
  });
  it("accounts for Lisbon summer time", () =>
    expect(afterHours("2027-05-14T08:00:00Z")).toBe(false));
  it("four cleaners have 960 minutes of capacity", () => {
    expect(housekeeping(21, 0, 0)).toMatchObject({
      cleaningMinutes: 945,
      capacityMinutes: 960,
      tight: false,
    });
    expect(housekeeping(22, 0, 0).tight).toBe(true);
  });
  it("six late departures exceed the one-hour late cleaning window", () =>
    expect(housekeeping(6, 6, 0).tight).toBe(true));
  it("agent cannot override price, nights or demo access", () => {
    const i = prepareInquiry({
      guest_name: "A Guest",
      contact: "guest@example.com",
      check_in: "2027-05-14",
      check_out: "2027-05-17",
      recommended_room: "Superior Balcony",
      recommended_extra: "Celebration package",
      call_started_at: "2026-11-20T23:00:00Z",
      call_ended_at: "2026-11-20T23:04:00Z",
      estimated_value: 1,
      is_demo: true,
    });
    expect(i).toMatchObject({
      estimated_value: 711,
      nights: 3,
      is_demo: false,
      after_hours: true,
      call_duration_sec: 240,
    });
  });
});
