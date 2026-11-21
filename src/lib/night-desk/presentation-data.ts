// Fixed fictional presentation data, intentionally separate from operational rates and records.
export type CaseStatus = "New" | "Contacted" | "Booked" | "Lost";
export type CaseGuest = {
  id: string;
  name: string;
  country: string;
  room: string;
  nights: number;
  dates: string;
  value: number;
  status: CaseStatus;
  note: string;
  deadline: string;
  afterHours: boolean;
};
export const followUps: CaseGuest[] = [
  { id: "f1", name: "Hannah Whitfield", country: "UK", room: "Family Suite", nights: 4, dates: "25–29 Nov", value: 1075, status: "New", note: "Needs cot + airport pickup", deadline: "11:00", afterHours: true },
  { id: "f2", name: "Alexander Weber", country: "Germany", room: "Classic Double", nights: 5, dates: "26 Nov–1 Dec", value: 742, status: "Contacted", note: "Late arrival, business invoice", deadline: "10:00", afterHours: true },
  { id: "f3", name: "Lauren & Mike Ostrowski", country: "USA", room: "Superior Balcony", nights: 3, dates: "28 Nov–1 Dec", value: 711, status: "New", note: "Wants a balcony with a view", deadline: "10:30", afterHours: true },
  { id: "f4", name: "Kenji Morimoto", country: "Japan", room: "Rooftop Suite", nights: 6, dates: "2–8 Dec", value: 1964, status: "Contacted", note: "Anniversary", deadline: "11:30", afterHours: true },
  { id: "f5", name: "Aoife Brennan", country: "Ireland", room: "Family Suite", nights: 5, dates: "27 Nov–2 Dec", value: 1338, status: "New", note: "Two children, early check-in", deadline: "12:00", afterHours: true },
  { id: "f6", name: "Rafael Duarte", country: "Brazil", room: "Classic Double", nights: 3, dates: "29 Nov–2 Dec", value: 456, status: "Contacted", note: "Asks about parking", deadline: "12:00", afterHours: true },
];
export const weeks = [
  { week: "W1", calls: 21, bookings: 9, revenue: 8214, note: "" },
  { week: "W2", calls: 28, bookings: 13, revenue: 12906, note: "Includes 9-night Rooftop Suite, €4,860" },
  { week: "W3", calls: 19, bookings: 7, revenue: 5377, note: "Rainy week, fewer walk-in calls" },
  { week: "W4", calls: 26, bookings: 12, revenue: 12145, note: "" },
];
const names = [
  ["Maya Collins", "UK"], ["Tobias Richter", "Germany"], ["Elena Costa", "Italy"], ["Daniel Okafor", "UK"],
  ["Sofia Laurent", "France"], ["Oliver Jensen", "Denmark"], ["Clara Mendes", "Portugal"], ["Ethan Brooks", "Canada"],
  ["Amelia Fischer", "Austria"], ["Lucas Ferreira", "Brazil"], ["Nora van Dijk", "Netherlands"], ["Liam Walsh", "Ireland"],
  ["Ines Bernard", "France"], ["Samira Wilson", "USA"], ["Felix Andersson", "Sweden"], ["Eva Romano", "Italy"],
  ["Gabriel Santos", "Portugal"], ["Chloe Martin", "Canada"], ["Ben Schneider", "Germany"], ["Leila Thompson", "UK"],
  ["Oscar Nilsson", "Sweden"], ["Alicia Ramos", "Spain"], ["Noah Patel", "USA"], ["Julia Moreau", "France"],
  ["Mateo Silva", "Portugal"], ["Freya Larsen", "Norway"], ["Simon Clarke", "Australia"], ["Hana Wilson", "New Zealand"],
  ["Nicolas Berger", "Switzerland"], ["Mariana Lopes", "Brazil"], ["Adam Hughes", "UK"], ["Sara Lind", "Denmark"],
  ["Theo Meyer", "Germany"], ["Celia Navarro", "Spain"], ["Hugo Beaumont", "France"], ["Zoe Mitchell", "Canada"],
  ["Adrian Chen", "USA"], ["Mila Novak", "Croatia"], ["Leo Pereira", "Portugal"], ["Isabel Turner", "UK"],
  ["Ruben Castillo", "Spain"], ["Louise Dubois", "Belgium"], ["Samuel Reid", "Australia"], ["Naomi Bennett", "USA"],
  ["Marco De Luca", "Italy"], ["Alice Dupont", "France"], ["David Evans", "Wales"], ["Catarina Alves", "Portugal"],
  ["Max Hoffmann", "Germany"], ["Sophie Laurent", "Belgium"], ["Aaron Kelly", "Ireland"], ["Lara Costa", "Brazil"],
  ["Victor Hansen", "Denmark"], ["Emilia Rossi", "Italy"], ["Owen Carter", "Canada"], ["Nadia Garcia", "Spain"],
  ["Alex Morgan", "UK"], ["Beatriz Nunes", "Portugal"], ["Jonas Berg", "Norway"], ["Lucie Robert", "France"],
  ["Marcus Allen", "USA"], ["Elisa Weber", "Germany"], ["Louis Lambert", "Belgium"], ["Amara James", "UK"],
  ["Andre Carvalho", "Brazil"], ["Rosa Martinez", "Spain"], ["Peter Wallace", "Australia"], ["Helena Sousa", "Portugal"],
  ["Finn Murphy", "Ireland"], ["Camille Petit", "France"], ["Eric Lewis", "Canada"], ["Diana Moretti", "Italy"],
  ["Leon Brandt", "Germany"], ["Olivia Green", "USA"], ["Tiago Reis", "Portugal"], ["Alma Svensson", "Sweden"],
  ["Nina Jacobs", "Netherlands"], ["Henry Scott", "UK"], ["Bruno Lima", "Brazil"], ["Estelle Roux", "France"],
  ["Martin Keller", "Switzerland"], ["Paula Torres", "Spain"], ["Avery Davis", "USA"], ["Rita Fernandes", "Portugal"],
  ["Sebastian Wood", "Australia"], ["Laura Conti", "Italy"], ["Elliot Price", "UK"], ["Annika Koch", "Germany"],
];
const bookedValues = [
  742, 711, 1075, 1964, 1338, 456, 760, 570, 598,
  4860, 742, 711, 1075, 1338, 456, 760, 570, 598, 450, 380, 540, 426,
  742, 711, 1075, 1338, 456, 580, 475,
  742, 711, 1075, 1964, 1338, 456, 760, 570, 598, 1480, 1480, 971,
];
const openValues = [742, 711, 1075, 456, 1338, 456, 760, 570, 598, 483, 1480, 971, 742, 711, 1075, 1338, 456, 570, 598, 1480, 1422];
function roomFor(value: number) {
  const possibilities = [
    { room: "Classic Double", min: 148, max: 152 },
    { room: "Superior Balcony", min: 190, max: 238 },
    { room: "Family Suite", min: 265, max: 270 },
    { room: "Rooftop Suite", min: 325, max: 540 },
  ];
  for (const spec of possibilities) {
    for (let nights = 1; nights <= 10; nights++) {
      if (value / nights >= spec.min && value / nights <= spec.max) return { room: spec.room, nights };
    }
  }
  return { room: "Rooftop Suite", nights: 3 };
}
const extraGuests: CaseGuest[] = names.map(([name, country], i) => {
  const status: CaseStatus = i < 41 ? "Booked" : i < 52 ? "New" : i < 62 ? "Contacted" : "Lost";
  const value = i < 41 ? (bookedValues[i] ?? 0) : i < 62 ? (openValues[i - 41] ?? 0) : [450, 760, 1075, 1964][i % 4] ?? 450;
  const stay = i === 9 ? { room: "Rooftop Suite", nights: 9 } : roomFor(value);
  const day = 22 + (i % 7);
  const end = day + stay.nights;
  return {
    id: `case-${i}`, name: name ?? "", country: country ?? "", ...stay, value, status,
    dates: end <= 30 ? `${day}–${end} Nov` : `${day} Nov–${end - 30} Dec`,
    note: "", deadline: "", afterHours: i < 65,
  };
});
export const caseGuests = [...followUps, ...extraGuests];
export const statusCounts = {
  All: caseGuests.length,
  New: caseGuests.filter((g) => g.status === "New").length,
  Contacted: caseGuests.filter((g) => g.status === "Contacted").length,
  Booked: caseGuests.filter((g) => g.status === "Booked").length,
  Lost: caseGuests.filter((g) => g.status === "Lost").length,
};
export const metrics = {
  calls: caseGuests.length,
  afterHours: caseGuests.filter((g) => g.afterHours).length,
  revenue: caseGuests.filter((g) => g.status === "Booked").reduce((sum, g) => sum + g.value, 0),
  risk: caseGuests.filter((g) => g.status === "New" || g.status === "Contacted").reduce((sum, g) => sum + g.value, 0),
  followUpValue: followUps.reduce((sum, g) => sum + g.value, 0),
};
export const commissionSaved = Math.round(metrics.revenue * 0.18);
export const money = (value: number) => `€${value.toLocaleString("en-GB")}`;