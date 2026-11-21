import { z } from "zod";
import { afterHours, priceStay } from "./pricing";
const text = z.string().max(2000);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => !Number.isNaN(Date.parse(s + "T00:00:00Z")), "Invalid date");
const clock = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const inquiryPayload = z
  .object({
    id: z.string().uuid().optional(),
    guest_name: z.string().min(1).max(120),
    contact: z.string().min(3).max(200),
    check_in: date,
    check_out: date,
    recommended_room: z.enum([
      "Classic Double",
      "Superior Balcony",
      "Family Suite",
      "Rooftop Suite",
    ]),
    recommended_extra: z
      .enum([
        "Airport transfer",
        "Celebration package",
        "Late check-out",
        "Bike rental",
        "Baby cot",
      ])
      .optional(),
    extras_interested: z
      .array(
        z.enum([
          "Airport transfer",
          "Celebration package",
          "Late check-out",
          "Bike rental",
          "Baby cot",
        ]),
      )
      .max(5)
      .default([]),
    call_started_at: z.string().datetime(),
    call_ended_at: z.string().datetime(),
    nationality: z.string().max(80).optional(),
    age: z.number().int().min(0).max(120).optional(),
    gender: z.string().max(50).optional(),
    language: z.string().max(50).default("English"),
    type_of_holiday: z
      .enum(["leisure", "romantic", "family", "business", "city break", "other"])
      .optional(),
    reason_for_stay: text.optional(),
    adults: z.number().int().min(1).max(4).default(2),
    children: z.number().int().min(0).max(3).default(0),
    arrival_time: clock.optional(),
    preferred_check_in_time: clock.default("15:00"),
    preferred_check_out_time: clock.default("11:00"),
    room_requested: text.optional(),
    budget: z.number().min(0).max(100000).optional(),
    special_requests: text.optional(),
    priority: z.enum(["hot", "warm", "cold"]).default("warm"),
    hesitation_reason: text.optional(),
    win_back_action: text.optional(),
    next_step: text.optional(),
    next_step_deadline: z.string().datetime().optional(),
    summary: text.optional(),
    transcript: z
      .array(
        z.object({
          speaker: z.enum(["Guest", "Agent"]),
          text: z.string().max(5000),
          timestamp: z.string().max(40),
        }),
      )
      .max(500)
      .default([]),
  })
  .refine((v) => v.check_out > v.check_in, "Check-out must follow check-in")
  .refine(
    (v) => Date.parse(v.call_ended_at) >= Date.parse(v.call_started_at),
    "Call end must follow call start",
  );
export function prepareInquiry(input: unknown) {
  const v = inquiryPayload.parse(input);
  const selected = [
    ...new Set([...v.extras_interested, ...(v.recommended_extra ? [v.recommended_extra] : [])]),
  ];
  const quote = priceStay(v.recommended_room, v.check_in, v.check_out, selected);
  return {
    ...(v.id ? { id: v.id } : {}),
    guest_name: v.guest_name,
    contact: v.contact,
    check_in: v.check_in,
    check_out: v.check_out,
    recommended_room: v.recommended_room,
    recommended_extra: v.recommended_extra ?? null,
    call_started_at: v.call_started_at,
    call_ended_at: v.call_ended_at,
    nationality: v.nationality ?? null,
    age: v.age ?? null,
    gender: v.gender ?? null,
    language: v.language,
    type_of_holiday: v.type_of_holiday ?? null,
    reason_for_stay: v.reason_for_stay ?? null,
    adults: v.adults,
    children: v.children,
    arrival_time: v.arrival_time ?? null,
    preferred_check_in_time: v.preferred_check_in_time,
    preferred_check_out_time: v.preferred_check_out_time,
    room_requested: v.room_requested ?? null,
    budget: v.budget ?? null,
    special_requests: v.special_requests ?? null,
    priority: v.priority,
    hesitation_reason: v.hesitation_reason ?? null,
    win_back_action: v.win_back_action ?? null,
    next_step: v.next_step ?? null,
    next_step_deadline: v.next_step_deadline ?? null,
    summary: v.summary ?? null,
    transcript: v.transcript,
    extras_interested: selected,
    nights: quote.nights,
    estimated_value: quote.total,
    call_duration_sec: Math.round(
      (Date.parse(v.call_ended_at) - Date.parse(v.call_started_at)) / 1000,
    ),
    after_hours: afterHours(v.call_started_at),
    channel: "voice agent",
    status: "new",
    availability_status: "to confirm",
    is_demo: false,
  };
}
