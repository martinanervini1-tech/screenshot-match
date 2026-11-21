export const rooms = {
  "Classic Double": { rate: 140, size: 18, description: "City view · Breakfast & Wi-Fi included" },
  "Superior Balcony": {
    rate: 185,
    size: 24,
    description: "Private balcony · Breakfast & Wi-Fi included",
  },
  "Family Suite": {
    rate: 260,
    size: 38,
    description: "Up to 4 guests · Breakfast & Wi-Fi included",
  },
  "Rooftop Suite": {
    rate: 340,
    size: 45,
    description: "Terrace & river view · Breakfast & Wi-Fi included",
  },
} as const;
export type Room = keyof typeof rooms;
export const extras = [
  "Airport transfer",
  "Celebration package",
  "Late check-out",
  "Bike rental",
  "Baby cot",
] as const;
export const euro = (value: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
export function priceStay(
  room: Room,
  checkIn: string,
  checkOut: string,
  selectedExtras: readonly string[] = [],
) {
  const start = new Date(checkIn + "T00:00:00Z");
  const end = new Date(checkOut + "T00:00:00Z");
  const nights = Math.round((end.getTime() - start.getTime()) / 86400000);
  if (!Number.isFinite(nights) || nights <= 0 || nights > 365)
    throw new Error("Stay must be between 1 and 365 nights");
  const nightly: { date: string; rate: number; summer: boolean }[] = [];
  for (let i = 0; i < nights; i++) {
    const date = new Date(start.getTime() + i * 86400000);
    const summer = date.getUTCMonth() >= 3 && date.getUTCMonth() <= 9;
    nightly.push({
      date: date.toISOString().slice(0, 10),
      rate: rooms[room].rate * (summer ? 1.2 : 1),
      summer,
    });
  }
  const extraLines = [...new Set(selectedExtras)].map((name) => ({
    name,
    value:
      name === "Airport transfer"
        ? 35
        : name === "Celebration package"
          ? 45
          : name === "Late check-out"
            ? 30
            : name === "Bike rental"
              ? nights * 15
              : 0,
  }));
  const roomTotal = nightly.reduce((sum, n) => sum + n.rate, 0);
  const extraTotal = extraLines.reduce((sum, e) => sum + e.value, 0);
  return { nights, nightly, roomTotal, extraLines, extraTotal, total: roomTotal + extraTotal };
}
export function commission(total: number, channel: string) {
  const rate = ["Booking.com", "Expedia", "other platform"].includes(channel) ? 0.18 : 0;
  return {
    rate,
    cost: Math.round(total * rate * 100) / 100,
    saved: rate === 0 ? Math.round(total * 0.18 * 100) / 100 : 0,
  };
}
export function afterHours(iso: string) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Lisbon",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date(iso)),
  );
  return hour < 9 || hour >= 18;
}
export function housekeeping(departures: number, late: number, early: number) {
  const cleaningMinutes = departures * 45;
  const capacityMinutes = 4 * 240;
  const lateCapacity = 4 * 60;
  const earlyCapacity = 4 * 60;
  return {
    cleaningMinutes,
    capacityMinutes,
    utilization: Math.round((cleaningMinutes / capacityMinutes) * 100),
    tight:
      cleaningMinutes > capacityMinutes || late * 45 > lateCapacity || early * 45 > earlyCapacity,
  };
}
