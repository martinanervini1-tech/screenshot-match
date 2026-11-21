import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Sun,
  ChartNoAxesCombined,
  MessagesSquare,
  MapPin,
  ChevronDown,
  ChevronRight,
  Menu,
  Building2,
  Radio,
  CircleHelp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStaff } from "./session";
import { initials } from "@/lib/night-desk/types";
import { Azulejo, TilePattern, TileStrip, LisbonSketch } from "./tile";
export function DeskShell({
  page,
  children,
}: {
  page: "Morning Desk" | "Analytics" | "Transcripts";
  children: ReactNode;
}) {
  const { name, staff, openAccount } = useStaff();
  const [mobile, setMobile] = useState(false);
  return (
    <div className="desk-layout">
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <TilePattern className="sidebar-pattern" />
        <div className="sidebar-content">
          <div className="brand">
            <div className="brand-mark">
              <Azulejo className="size-8" />
              <span className="eyebrow text-gold">EST. LISBOA</span>
            </div>
            <h2>Casa Lisboa</h2>
            <p>A little closer to Lisbon.</p>
          </div>
          <p className="side-label">The Night Desk</p>
          <nav className="side-nav">
            <Link
              to="/"
              className={page === "Morning Desk" ? "active" : ""}
              onClick={() => setMobile(false)}
            >
              <Sun />
              Morning Desk<span className="nav-count">6</span>
            </Link>
            <Link
              to="/analytics"
              className={page === "Analytics" ? "active" : ""}
              onClick={() => setMobile(false)}
            >
              <ChartNoAxesCombined />
              Analytics
            </Link>
            <Link
              to="/transcripts"
              className={page === "Transcripts" ? "active" : ""}
              onClick={() => setMobile(false)}
            >
              <MessagesSquare />
              Transcripts
            </Link>
          </nav>
          <div className="side-label mt-9">Your property</div>
          <div className="side-nav">
            <Button variant="sidebar" className="justify-start" onClick={openAccount}>
              <Building2 />
              Hotel team
              <ChevronRight className="ml-auto" />
            </Button>
          </div>
          <div className="sidebar-bottom">
            <LisbonSketch />
            <p className="sidebar-note">The city sleeps. We listen.</p>
            <div className="property-info">
              <MapPin size={14} />
              <span>Lisbon, Portugal · 24 rooms</span>
            </div>
          </div>
        </div>
      </aside>
      <header className="topbar">
        <div className="breadcrumb">
          <Button
            variant="ghost"
            size="icon"
            className="mobile-menu"
            aria-label="Toggle navigation"
            onClick={() => setMobile(!mobile)}
          >
            <Menu />
          </Button>
          <span>Night Desk</span>
          <ChevronRight size={12} />
          <strong>{page}</strong>
        </div>
        <div className="topbar-right">
          <span className="live-pill">
            <span className="live-dot" />
            {staff ? "Desk is live" : "Voice concierge ready"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            title="Hotel policies"
            aria-label="Hotel policies"
            onClick={() =>
              document.getElementById("hotel-policies")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <CircleHelp />
          </Button>
          <Button variant="ghost" className="profile-trigger" onClick={openAccount}>
            <span className="avatar">{initials(name)}</span>
            <span>{name}</span>
            <ChevronDown size={12} />
          </Button>
        </div>
      </header>
      <TileStrip />
      <main className="page-content">
        {children}
        <footer className="footer-note" id="hotel-policies">
          <div>
            <span className="fiction-label">
              <Radio size={10} />
              Fictional case data · Casa Lisboa
            </span>
            <div className="mt-1">
              Reservations 09:00–18:00 · Check-in 15:00 / Check-out 11:00 · Free cancellation up to
              48h
            </div>
          </div>
          <span className="footer-signature">Made for a warmer welcome.</span>
        </footer>
      </main>
    </div>
  );
}
export function PageIntro({
  title,
  eyebrow,
  subtitle,
  days,
  onDays,
}: {
  title: string;
  eyebrow: string;
  subtitle: string;
  days?: number;
  onDays?: (n: number) => void;
}) {
  return (
    <div className="page-intro">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="greeting">{title}</h1>
        <p className="intro-sub">{subtitle}</p>
      </div>
      <div className="intro-date">
        <span className="flex items-center gap-2">
          <Sun size={15} className="text-sunset" />
          Saturday, 21 November 2026
        </span>
        {onDays && (
          <select
            className="period-control"
            aria-label="Reporting period"
            value={days}
            onChange={(e) => onDays(Number(e.target.value))}
          >
            <option value={60}>Last 60 days</option>
            <option value={30}>Last 30 days</option>
            <option value={7}>Last 7 days</option>
            <option value={1}>Last 24 hours</option>
          </select>
        )}
      </div>
    </div>
  );
}
