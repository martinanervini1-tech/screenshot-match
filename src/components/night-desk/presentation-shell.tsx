import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { LayoutDashboard, PhoneIncoming, List, ChartNoAxesCombined, ChevronLeft, ChevronRight, ArrowUpRight, Phone, ArrowDownToLine, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Azulejo, TilePattern } from "./tile";
import { briefingDelay, briefingSessionKey, commissionSaved, metrics, money, nightBriefing } from "@/lib/night-desk/presentation-data";
import { NightBriefing } from "./night-briefing";
import { NotificationInboxPopover } from "./notification-inbox-popover";
import { briefingSummary, handledSessionKey, parseHandledCalls, setCallHandled } from "@/lib/night-desk/briefing-state";

const views = [
  { label: "Overview", to: "/", icon: LayoutDashboard },
  { label: "Follow-ups", to: "/follow-ups", icon: PhoneIncoming },
  { label: "Inquiries", to: "/inquiries", icon: List },
  { label: "Analytics", to: "/analytics", icon: ChartNoAxesCombined },
] as const;

export function PresentationShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [briefingSeen, setBriefingSeen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [receive, setReceive] = useState(0);
  const [handledIds, setHandledIds] = useState<string[]>([]);
  const summary = briefingSummary(handledIds);
  useEffect(() => {
    try { setHandledIds(parseHandledCalls(sessionStorage.getItem(handledSessionKey))); } catch { /* Use session-local memory if storage is unavailable. */ }
  }, []);
  function handleCall(id: string, handled: boolean) {
    setHandledIds((ids) => {
      const next = setCallHandled(ids, id, handled);
      try { sessionStorage.setItem(handledSessionKey, JSON.stringify(next)); } catch { /* In-memory tracking remains available. */ }
      return next;
    });
  }
  useEffect(() => {
    if (pathname !== "/" || briefingSeen) return;
    try { if (sessionStorage.getItem(briefingSessionKey)) { setBriefingSeen(true); return; } } catch { /* Storage may be unavailable. */ }
    const timer = window.setTimeout(() => {
      setBriefingOpen(true);
      setBriefingSeen(true);
      try { sessionStorage.setItem(briefingSessionKey, "1"); } catch { /* In-memory state still prevents repeated automatic opening. */ }
    }, briefingDelay);
    return () => window.clearTimeout(timer);
  }, [pathname, briefingSeen]);
  const current = Math.max(0, views.findIndex((view) => view.to === pathname));
  const view = views[current] ?? views[0];
  const duration = reduced ? 0 : 0.3;
  function move(direction: number) {
    const next = views[(current + direction + views.length) % views.length];
    if (next) void navigate({ to: next.to });
  }
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (briefingOpen || inboxOpen) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.target instanceof HTMLElement && (event.target.matches("input,textarea,select") || event.target.isContentEditable || event.target.closest('[role="tablist"]'))) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const next = views[(current + (event.key === "ArrowRight" ? 1 : -1) + views.length) % views.length];
      if (next) void navigate({ to: next.to });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, navigate, briefingOpen, inboxOpen]);
  const kpis = [
    { label: "Calls handled", value: String(metrics.calls), note: "76% after hours", meaning: "calls", to: "/inquiries", icon: Phone, destination: "All inquiries" },
    { label: "Revenue booked by concierge", value: money(metrics.revenue), note: "41 direct bookings", meaning: "revenue", to: "/analytics", icon: ArrowDownToLine, destination: "Weekly revenue" },
    { label: "Commission saved", value: money(commissionSaved), note: "vs. 18% OTA commission", meaning: "saved", to: "/analytics", icon: ShieldCheck, destination: "Booking analytics" },
    { label: "Revenue at risk", value: money(metrics.risk), note: "27 open inquiries (New + Contacted)", meaning: "risk", to: "/inquiries", icon: Clock, destination: "Inquiry outcomes" },
  ] as const;
  return (
    <LayoutGroup id="casa-presentation">
      <div className="presentation">
        <div className="presentation-nav-backdrop" data-visible={open} aria-hidden="true" />
        <motion.aside className="presentation-sidebar" data-expanded={open} aria-label="Main navigation" animate={{ width: open ? 240 : 56 }} transition={{ duration: reduced ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
          <TilePattern className="presentation-sidebar-pattern" />
          <div className="presentation-sidebar-brand"><Azulejo /><motion.span animate={{ opacity: open ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.2 }}>Casa Lisboa</motion.span></div>
          <nav>
            {views.map((item, index) => (
              <Button asChild variant="ghost" className={`presentation-nav-item ${item.to === pathname ? "is-current" : ""}`} key={item.to}>
                <Link to={item.to} aria-label={item.label} title={open ? undefined : item.label} aria-current={item.to === pathname ? "page" : undefined}>
                  {item.to === pathname && <motion.span className="presentation-nav-indicator" layoutId="nav-indicator" transition={{ duration }} />}
                  <item.icon /><motion.span className="presentation-nav-label" animate={{ opacity: open ? 1 : 0, x: open ? 0 : -8 }} transition={{ duration: reduced ? 0 : 0.25, delay: reduced || !open ? 0 : 0.06 + index * 0.035 }}>{item.label}</motion.span><ArrowUpRight className="presentation-nav-arrow" />
                </Link>
              </Button>
            ))}
          </nav>
          <div className="presentation-sidebar-tile"><Azulejo /><motion.div animate={{ opacity: open ? 1 : 0 }} transition={{ duration }}><strong>Night Desk</strong><span>Lisbon · 24 rooms</span></motion.div></div>
        </motion.aside>
        <header className="presentation-header">
          <div className="presentation-wordmark">Casa Lisboa<span>Night Desk</span></div>
          <div className="presentation-header-actions"><NotificationInboxPopover bellRef={bellRef} receive={receive} handledIds={handledIds} onHandled={handleCall} open={inboxOpen} onOpenChange={setInboxOpen} onBriefing={() => setBriefingOpen(true)} /><div className="presentation-period">Last 30 days<span>23 Oct–21 Nov 2026</span></div></div>
        </header>
        <main className="presentation-main">
          <div className="presentation-title-row">
            <AnimatePresence mode="wait" initial={false}><motion.h1 key={view.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration }}>{view.label}</motion.h1></AnimatePresence>
            <span className="presentation-title-note">Casa Lisboa, Lisbon</span>
          </div>
          {pathname === "/" && <div className="presentation-kpis">
            {kpis.map((kpi, index) => (
              <motion.article layoutId={`kpi-${index}`} className={`presentation-kpi ${kpi.meaning}`} key={kpi.label} transition={{ duration, ease: "easeOut" }}>
                <Button variant="kpi" asChild>
                  <Link to={kpi.to} aria-label={`${kpi.label}: ${kpi.value}. ${kpi.note}. View ${kpi.destination.toLowerCase()}`}>
                    <span className="presentation-kpi-label"><kpi.icon /><span>{kpi.label}</span></span>
                    <span className="presentation-kpi-value">{kpi.value}</span>
                    <span className="presentation-kpi-note">{kpi.note}</span>
                    <ArrowUpRight className="presentation-kpi-arrow" />
                    {kpi.meaning === "revenue" && <span className="presentation-kpi-destination">{kpi.destination}<ArrowUpRight /></span>}
                  </Link>
                </Button>
              </motion.article>
            ))}
          </div>}
          <motion.div layoutId="last-night" transition={{ duration }}><Button variant="ghost" className="presentation-night briefing-strip" aria-label="Open Night Desk briefing" onClick={() => setBriefingOpen(true)}><span className="presentation-night-dot" /><span>Last night: <strong>{nightBriefing.calls} calls</strong>, <strong>{summary.count} need a follow-up</strong></span><span>{money(summary.potentialValue)} in potential stays</span></Button></motion.div>
          <div className="presentation-view">{children}</div>
          <footer className="presentation-footer">Fictional case data · Casa Lisboa, Lisbon · 24 rooms</footer>
        </main>
        <nav className="presentation-pager" aria-label="View navigation">
          <Button variant="ghost" size="icon" aria-label="Previous view" title="Previous view" onClick={() => move(-1)}><ChevronLeft /></Button>
          <span aria-live="polite">{current + 1} / 4</span>
          <Button variant="ghost" size="icon" aria-label="Next view" title="Next view" onClick={() => move(1)}><ChevronRight /></Button>
        </nav>
        <NightBriefing open={briefingOpen} onOpenChange={setBriefingOpen} bellRef={bellRef} onReceive={() => setReceive((value) => value + 1)} handledIds={handledIds} />
      </div>
    </LayoutGroup>
  );
}