import { useEffect, useRef, useState, type RefObject } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogPortal, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { money, nightBriefing } from "@/lib/night-desk/presentation-data";
import { briefingSummary } from "@/lib/night-desk/briefing-state";
import { BriefingCalls } from "./briefing-calls";

function BriefingNumbers({ count, value }: { count: number; value: number }) {
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = Math.min(1, (now - start) / 1000);
      setProgress(1 - Math.pow(1 - elapsed, 3));
      if (elapsed < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);
  const amount = reduced ? 1 : progress;
  return <div className="briefing-kpis" aria-label={`${nightBriefing.calls} calls handled, ${count} need a follow-up, ${money(value)} in potential stays`}>
    <div className="briefing-kpi"><span>Calls handled</span><strong aria-hidden="true">{Math.round(nightBriefing.calls * amount)}</strong></div>
    <div className="briefing-kpi is-followup"><span>Need a follow-up</span><strong aria-hidden="true">{Math.round(count * amount)}</strong></div>
    <div className="briefing-kpi is-value"><span>Potential stays</span><strong aria-hidden="true">{money(Math.round(value * amount))}</strong></div>
  </div>;
}

export function NightBriefing({ open, onOpenChange, bellRef, onReceive, handledIds }: {
  open: boolean; onOpenChange: (open: boolean) => void;
  bellRef: RefObject<HTMLButtonElement | null>; onReceive: () => void; handledIds: readonly string[];
}) {
  const reduced = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const [flight, setFlight] = useState<{ x: number; y: number } | null>(null);
  const summary = briefingSummary(handledIds);
  function close() {
    if (flight) return;
    const bell = bellRef.current?.getBoundingClientRect();
    const panel = contentRef.current?.getBoundingClientRect();
    setFlight({ x: bell && panel && !reduced ? bell.x + bell.width / 2 - panel.x - panel.width / 2 : 0, y: bell && panel && !reduced ? bell.y + bell.height / 2 - panel.y - panel.height / 2 : 0 });
  }
  return <Dialog open={open} onOpenChange={(next) => { if (!next) close(); else onOpenChange(next); }}><DialogPortal>
    <DialogPrimitive.Overlay asChild><motion.div className="briefing-overlay" initial={{ opacity: 0 }} animate={{ opacity: flight ? 0 : 1 }} transition={{ duration: reduced ? 0.15 : 0.3 }} /></DialogPrimitive.Overlay>
    <div className="briefing-position">
    <DialogPrimitive.Content asChild aria-label="Night Desk briefing" onCloseAutoFocus={(event) => { event.preventDefault(); bellRef.current?.focus(); }}>
    <motion.div ref={contentRef} className="night-briefing" data-closing={Boolean(flight)} initial={{ opacity: 0, scale: reduced ? 1 : 0.97 }} animate={flight ? { opacity: 0, scale: reduced ? 1 : 0.1, x: flight.x, y: flight.y } : { opacity: 1, scale: 1, x: 0, y: 0 }} transition={{ duration: reduced ? 0.15 : flight ? 0.45 : 0.3, ease: "easeInOut" }} onAnimationComplete={() => { if (flight) { onOpenChange(false); setFlight(null); onReceive(); } }}>
      <header className="briefing-header">
        <p className="briefing-eyebrow">NIGHT DESK · 22:00 – 07:00</p>
        <DialogTitle className="briefing-title">Good morning. Here's last night.</DialogTitle>
        <DialogDescription className="briefing-subtitle">Your AI concierge handled every call while the front desk was closed.</DialogDescription>
        <DialogClose asChild><Button variant="ghost" size="icon" className="briefing-close" aria-label="Close briefing" title="Close briefing"><X /></Button></DialogClose>
      </header>
      <BriefingNumbers count={summary.count} value={summary.potentialValue} />
      <section className="briefing-followups" aria-labelledby="briefing-followups-title">
        <h3 id="briefing-followups-title">Follow-ups <span>{summary.count}</span></h3>
        <BriefingCalls calls={summary.openCalls} onNavigate={close} />
        {summary.count === 0 && <p className="notification-empty">All follow-ups handled.</p>}
      </section>
      <p className="briefing-resolved">{nightBriefing.resolved} other calls were resolved by the concierge. No action needed.</p>
      <footer className="briefing-footer">
        <Button asChild><Link to="/follow-ups" search={{}} onClick={close}>Review follow-ups<ArrowUpRight /></Link></Button>
        <Button variant="ghost" onClick={close}>Go to dashboard</Button>
      </footer>
    </motion.div></DialogPrimitive.Content></div>
  </DialogPortal></Dialog>;
}