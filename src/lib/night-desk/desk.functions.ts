import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";
export const getDemoDesk = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Hotel data is unavailable");
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_")) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
  const [inquiries, bookings] = await Promise.all([
    client
      .from("inquiries")
      .select("*")
      .eq("is_demo", true)
      .order("created_at", { ascending: false }),
    client
      .from("bookings")
      .select("*")
      .eq("is_demo", true)
      .order("created_at", { ascending: false }),
  ]);
  if (inquiries.error || bookings.error) throw new Error("Could not load the hotel case data");
  return { inquiries: inquiries.data ?? [], bookings: bookings.data ?? [] };
});
export const getStaffDesk = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: allowed } = await context.supabase.rpc("is_staff");
    if (!allowed)
      throw new Error("Your account needs staff access. Ask your hotel manager to approve it.");
    const [inquiries, bookings] = await Promise.all([
      context.supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000),
      context.supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000),
    ]);
    if (inquiries.error || bookings.error) throw new Error("Could not load hotel records");
    return { inquiries: inquiries.data ?? [], bookings: bookings.data ?? [] };
  });
export const updateInquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "contacted", "booked", "lost"]),
        availability_status: z.enum(["to confirm", "confirmed", "not available"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("inquiries")
      .update({
        status: data.status,
        ...(data.availability_status ? { availability_status: data.availability_status } : {}),
      })
      .eq("id", data.id)
      .select()
      .single();
    if (error || !row) throw new Error("Only approved hotel staff can update inquiries.");
    return row;
  });
