import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prepareInquiry } from "@/lib/night-desk/ingestion";
export const Route = createFileRoute("/api/public/inquiries")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["NIGHT_DESK_WEBHOOK_SECRET"];
        if (!secret)
          return Response.json(
            { error: "Voice-agent connection has not been configured" },
            { status: 503 },
          );
        const timestamp = request.headers.get("x-night-desk-timestamp") ?? "";
        const signature = request.headers.get("x-night-desk-signature") ?? "";
        if (
          !/^\d+$/.test(timestamp) ||
          Math.abs(Date.now() / 1000 - Number(timestamp)) > 300 ||
          !/^[a-f0-9]{64}$/.test(signature)
        )
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        const body = await request.text();
        if (body.length > 250000)
          return Response.json({ error: "Payload too large" }, { status: 413 });
        const expected = createHmac("sha256", secret)
          .update(timestamp + "." + body)
          .digest("hex");
        if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected)))
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        try {
          const row = prepareInquiry(JSON.parse(body));
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("inquiries")
            .insert(row)
            .select("id")
            .single();
          if (error?.code === "23505" && row.id)
            return Response.json({ id: row.id, received: true }, { status: 200 });
          if (error || !data)
            return Response.json({ error: "Could not save inquiry" }, { status: 500 });
          return Response.json({ id: data.id, received: true }, { status: 201 });
        } catch {
          return Response.json(
            { error: "Invalid inquiry. Check guest, stay and call details." },
            { status: 400 },
          );
        }
      },
    },
  },
});
