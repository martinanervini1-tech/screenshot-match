import { useState, type RefObject } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { money, nightBriefing } from "@/lib/night-desk/presentation-data";
import { briefingSummary, resolvedCalls } from "@/lib/night-desk/briefing-state";
import { BriefingCalls } from "./briefing-calls";

export function NotificationInboxPopover({ bellRef, receive, handledIds, onHandled, open, onOpenChange, onBriefing }: {
  bellRef: RefObject<HTMLButtonElement | null>;
  receive: number;
  handledIds: readonly string[];
  onHandled: (id: string, handled: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBriefing: () => void;
}) {
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<"needs" | "all">("needs");
  const summary = briefingSummary(handledIds);
  const calls = tab === "needs" ? summary.openCalls : [...nightBriefing.followUps, ...resolvedCalls].sort((a,b) => a.time.localeCompare(b.time));
  return <Popover open={open} onOpenChange={(next) => { if (next) setTab("needs"); onOpenChange(next); }}>
    <PopoverTrigger asChild><Button ref={bellRef} variant="outline" size="icon" className="notification-bell" aria-label={`Night Desk notifications, ${summary.count} open follow-ups`} title="Night Desk notifications">
      <motion.span key={`bell-${receive}`} className="notification-bell-icon" animate={{ rotate: receive && !reduced ? [0,-12,12,0] : 0 }} transition={{ duration: 0.32 }}><Bell /></motion.span>
      <AnimatePresence>{summary.count > 0 && <motion.span key={`badge-${receive}`} className="notification-badge" initial={{ scale: receive && !reduced ? 0 : 1 }} animate={{ scale: receive && !reduced ? [0,1.15,1] : 1 }} exit={{ scale: reduced ? 1 : 0, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.3 }} aria-hidden="true">{summary.count}</motion.span>}</AnimatePresence>
    </Button></PopoverTrigger>
    <PopoverContent className="notification-inbox" align="end" sideOffset={12} aria-label="Night Desk notification inbox">
      <header><p className="briefing-eyebrow">NIGHT DESK · LAST NIGHT</p><h2>{summary.count === 0 ? "All follow-ups handled" : `${summary.count} calls need a follow-up`}</h2><p className="notification-total" aria-live="polite">{money(summary.potentialValue)} in potential stays</p></header>
      <div className="notification-tabs" role="tablist" aria-label="Night calls" onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? "needs" : event.key === "End" ? "all" : tab === "needs" ? "all" : "needs";
        setTab(next); document.getElementById(`inbox-tab-${next}`)?.focus();
      }}>
        {(["needs", "all"] as const).map((value) => <Button key={value} id={`inbox-tab-${value}`} variant="ghost" role="tab" aria-selected={tab === value} tabIndex={tab === value ? 0 : -1} aria-controls="inbox-calls" onClick={() => setTab(value)}>{value === "needs" ? "Needs follow-up" : `All calls (${nightBriefing.calls})`}</Button>)}
      </div>
      <div className="notification-calls" id="inbox-calls" role="tabpanel" aria-labelledby={`inbox-tab-${tab}`}>
        {calls.length ? <BriefingCalls calls={calls} handledIds={handledIds} onHandled={onHandled} onNavigate={() => onOpenChange(false)} /> : <p className="notification-empty">No calls need a follow-up.</p>}
      </div>
      <footer className="notification-footer"><Button variant="link" onClick={() => { onOpenChange(false); onBriefing(); }}>Night Desk briefing</Button><Button variant="outline" asChild><Link to="/follow-ups" search={{}} onClick={() => onOpenChange(false)}>Review follow-ups<ArrowUpRight /></Link></Button></footer>
    </PopoverContent>
  </Popover>;
}