import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { LayoutDashboard, PhoneIncoming, List, ChartNoAxesCombined, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Azulejo } from "./tile";
import { commissionSaved, metrics, money } from "@/lib/night-desk/presentation-data";

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
  const current = Math.max(0, views.findIndex((view) => view.to === pathname));
  const view = views[current] ?? views[0];
  const duration = reduced ? 0 : 0.25;
  function move(direction: number) {
    const next = views[(current + direction + views.length) % views.length];
    if (next) void navigate({ to: next.to });
  }
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.target instanceof HTMLElement && (event.target.matches("input,textarea,select") || event.target.isContentEditable || event.target.closest('[role="tablist"]'))) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const next = views[(current + (event.key === "ArrowRight" ? 1 : -1) + views.length) % views.length];
      if (next) void navigate({ to: next.to });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, navigate]);
  const kpis = [
    { label: "Calls handled", value: String(metrics.calls), note: "76% after hours", meaning: "neutral" },
    { label: "Revenue booked by concierge", value: money(metrics.revenue), note: "41 direct bookings", meaning: "positive" },
    { label: "Commission saved", value: money(commissionSaved), note: "vs. 18% OTA commission", meaning: "positive" },
    { label: "Revenue at risk", value: money(metrics.risk), note: "27 open inquiries (New + Contacted)", meaning: "risk" },
  ];
  return (
    <LayoutGroup id="casa-presentation">
      <div className="presentation">
        <motion.aside className="presentation-sidebar" aria-label="Main navigation" animate={{ width: open ? 208 : 56 }} transition={{ duration: reduced ? 0 : 0.2, ease: "easeOut" }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
          <div className="presentation-sidebar-brand"><Azulejo /><motion.span animate={{ opacity: open ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.2 }}>Casa Lisboa</motion.span></div>
          <nav>
            {views.map((item) => (
              <Button asChild variant="ghost" className={`presentation-nav-item ${item.to === pathname ? "is-current" : ""}`} key={item.to}>
                <Link to={item.to} aria-label={item.label} title={open ? undefined : item.label} aria-current={item.to === pathname ? "page" : undefined}>
                  {item.to === pathname && <motion.span className="presentation-nav-indicator" layoutId="nav-indicator" transition={{ duration }} />}
                  <item.icon /><motion.span className="presentation-nav-label" animate={{ opacity: open ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.2 }}>{item.label}</motion.span>
                </Link>
              </Button>
            ))}
          </nav>
          <div className="presentation-sidebar-tile"><Azulejo /></div>
        </motion.aside>
        <header className="presentation-header">
          <div className="presentation-wordmark">Casa Lisboa<span>Night Desk</span></div>
          <div className="presentation-period">Last 30 days<span>23 Oct–21 Nov 2026</span></div>
        </header>
        <main className="presentation-main">
          <div className="presentation-title-row">
            <AnimatePresence mode="wait" initial={false}><motion.h1 key={view.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration }}>{view.label}</motion.h1></AnimatePresence>
            <span className="presentation-title-note">Casa Lisboa, Lisbon</span>
          </div>
          <div className="presentation-kpis">
            {kpis.map((kpi, index) => (
              <motion.article layoutId={`kpi-${index}`} className={`presentation-kpi ${kpi.meaning}`} key={kpi.label} transition={{ duration, ease: "easeOut" }}>
                <motion.div key={`${pathname}-${kpi.label}`} initial={{ opacity: reduced ? 1 : 0.4 }} animate={{ opacity: 1 }} transition={{ duration, ease: "easeOut" }}>
                  <h2>{kpi.label}</h2><p className="presentation-kpi-value">{kpi.value}</p><p className="presentation-kpi-note">{kpi.note}</p>
                </motion.div>
              </motion.article>
            ))}
          </div>
          <motion.div layoutId="last-night" className="presentation-night" transition={{ duration }}><span className="presentation-night-dot" /><p>Last night: <strong>9 calls</strong>, <strong>6 need a follow-up</strong></p><span>€6,286 in potential stays</span></motion.div>
          <div className="presentation-view">{children}</div>
          <footer className="presentation-footer">Fictional case data · Casa Lisboa, Lisbon · 24 rooms</footer>
        </main>
        <nav className="presentation-pager" aria-label="View navigation">
          <Button variant="ghost" size="icon" aria-label="Previous view" title="Previous view" onClick={() => move(-1)}><ChevronLeft /></Button>
          <span aria-live="polite">{current + 1} / 4</span>
          <Button variant="ghost" size="icon" aria-label="Next view" title="Next view" onClick={() => move(1)}><ChevronRight /></Button>
        </nav>
      </div>
    </LayoutGroup>
  );
}