import { useEffect, useState } from "react";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { demoDeskOptions } from "@/lib/night-desk/queries";
import { getStaffDesk, updateInquiry } from "@/lib/night-desk/desk.functions";
import type { Inquiry, DeskData } from "@/lib/night-desk/types";
import { useStaff } from "./session";
import { toast } from "sonner";
export function useDesk() {
  const { user, staff } = useStaff();
  const demo = useSuspenseQuery(demoDeskOptions);
  const fetchStaff = useServerFn(getStaffDesk);
  const mutate = useServerFn(updateInquiry);
  const queryClient = useQueryClient();
  const live = useQuery({
    queryKey: ["desk", "staff", user?.id],
    queryFn: () => fetchStaff(),
    enabled: Boolean(user && staff),
  });
  const [highlight, setHighlight] = useState("");
  const [saving, setSaving] = useState("");
  useEffect(() => {
    const channel = supabase
      .channel(`night-desk-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "inquiries" }, (payload) => {
        void queryClient.invalidateQueries({ queryKey: ["desk"] });
        if (payload.eventType === "INSERT") {
          const row = payload.new;
          setHighlight(String(row["id"]));
          toast.success("A new guest inquiry has arrived");
        }
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
  async function setStatus(inquiry: Inquiry, status: Inquiry["status"]) {
    setSaving(inquiry.id);
    try {
      if (user && staff) {
        await mutate({
          data: {
            id: inquiry.id,
            status: status as "new" | "contacted" | "booked" | "lost",
            ...(status === "booked" ? { availability_status: "confirmed" as const } : {}),
          },
        });
        await queryClient.invalidateQueries({ queryKey: ["desk"] });
      } else {
        queryClient.setQueryData<DeskData>(["desk", "demo"], (prev) =>
          prev
            ? {
                ...prev,
                inquiries: prev.inquiries.map((i) => (i.id === inquiry.id ? { ...i, status } : i)),
                bookings:
                  status === "booked" && !prev.bookings.some((b) => b.inquiry_id === inquiry.id)
                    ? [
                        ...prev.bookings,
                        {
                          id: inquiry.id,
                          inquiry_id: inquiry.id,
                          channel: "voice agent",
                          created_at: new Date().toISOString(),
                          check_in: inquiry.check_in,
                          check_out: inquiry.check_out,
                          nights: inquiry.nights,
                          room: inquiry.recommended_room,
                          extras: inquiry.extras_interested,
                          total_value: inquiry.estimated_value,
                          commission_rate: 0,
                          commission_cost: 0,
                          decision_time_minutes: 0,
                          nationality: inquiry.nationality,
                          age: inquiry.age,
                          gender: inquiry.gender,
                          type_of_holiday: inquiry.type_of_holiday,
                          reason_for_stay: inquiry.reason_for_stay,
                          is_demo: true,
                        },
                      ]
                    : prev.bookings,
              }
            : prev,
        );
      }
      toast.success(
        `${inquiry.guest_name} marked as ${status}${!staff ? " · Fictional case only" : ""}`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save status");
    } finally {
      setSaving("");
    }
  }
  return {
    ...(staff && live.data ? live.data : demo.data),
    setStatus,
    highlight,
    saving,
    staff,
    loading: staff && live.isPending,
    error: live.error,
  };
}
