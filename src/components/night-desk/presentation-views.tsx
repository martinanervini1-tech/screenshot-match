import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { caseGuests, followUps, metrics, money, statusCounts, weeks, type CaseGuest, type CaseStatus } from "@/lib/night-desk/presentation-data";

function Section({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.section layoutId={id} className={`presentation-section ${className}`} initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 0.25, ease: "easeOut" }}>{children}</motion.section>;
}
function GuestStatus({ status }: { status: CaseStatus }) {
  return <span className={`case-status case-status-${status.toLowerCase()}`}><span />{status}</span>;
}
function FollowUpList({ compact = false }: { compact?: boolean }) {
  return <Section id="follow-ups"><div className="presentation-section-heading"><h2>Follow-ups for this morning <span>6</span></h2><p>{money(metrics.followUpValue)} total</p></div>
    <div className={`presentation-followups ${compact ? "is-compact" : ""}`}>
      {followUps.slice(0, compact ? 3 : 6).map((guest, i) => <motion.article layoutId={`followup-${guest.id}`} className="presentation-followup" key={guest.id}>
        <span className="case-number">{String(i + 1).padStart(2, "0")}</span>
        <div className="case-followup-info"><div className="case-followup-name"><h3>{guest.name}</h3><GuestStatus status={guest.status} /></div><p className="case-meta">{guest.country} · {guest.room} · {guest.nights} nights · <span className="case-dates">{guest.dates}</span></p><p className="case-note">{guest.note}</p></div>
        <div className="case-followup-value"><strong>{money(guest.value)}</strong><span><Clock size={13} />Call by {guest.deadline}</span></div>
      </motion.article>)}
    </div>
  </Section>;
}
function InquiryTable({ guests }: { guests: CaseGuest[] }) {
  return <div className="presentation-table-scroll" role="region" aria-label="Guest inquiries" tabIndex={0}><table className="presentation-table"><colgroup><col className="case-col-guest"/><col className="case-col-stay"/><col className="case-col-room"/><col className="case-col-value"/><col className="case-col-status"/></colgroup>
    <thead><tr><th>Guest</th><th>Stay</th><th>Room</th><th className="case-value-cell">Value</th><th>Status</th></tr></thead>
    <tbody>{guests.map((guest) => <tr key={guest.id}><td><strong>{guest.name}</strong><small>{guest.country}</small></td><td><span className="case-dates">{guest.dates}</span><small>{guest.nights} nights</small></td><td>{guest.room}</td><td className="case-value-cell">{money(guest.value)}</td><td><GuestStatus status={guest.status} /></td></tr>)}</tbody>
  </table></div>;
}
function InquirySummary() {
  return <Section id="inquiry-summary"><div className="presentation-section-heading"><h2>Inquiry outcomes</h2><p>94 total</p></div><div className="presentation-outcomes">
    {(["Booked", "New", "Contacted", "Lost"] as const).map((status) => <div key={status}><GuestStatus status={status} /><strong>{statusCounts[status]}</strong><div className="case-outcome-track"><span className={`case-outcome-${status.toLowerCase()}`} style={{ width: `${statusCounts[status] / 94 * 100}%` }} /></div></div>)}
    </div><p className="presentation-afterhours">71 of 94 calls received after hours <strong>76%</strong></p>
  </Section>;
}
export function OverviewPresentation() {
  return <><div className="presentation-overview-grid"><FollowUpList compact /><InquirySummary /></div><Section id="inquiries"><div className="presentation-section-heading"><h2>All inquiries</h2><p>94 total · Recent conversations</p></div><InquiryTable guests={caseGuests.slice(0, 5)} /></Section></>;
}
export function FollowUpsPresentation() { return <FollowUpList />; }
export function InquiriesPresentation() {
  const [filter, setFilter] = useState<"All" | CaseStatus>("All");
  const filtered = filter === "All" ? caseGuests : caseGuests.filter((g) => g.status === filter);
  return <Section id="inquiries"><div className="presentation-section-heading"><h2>All inquiries</h2><p>Last 30 days</p></div>
    <div className="presentation-tabs" role="tablist" aria-label="Inquiry status" onKeyDown={(event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const tabs: ("All" | CaseStatus)[] = ["All", "New", "Contacted", "Booked", "Lost"];
      const next = tabs[(tabs.indexOf(filter) + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
      if (next) { setFilter(next); document.getElementById(`status-tab-${next}`)?.focus(); }
    }}>
      {(["All", "New", "Contacted", "Booked", "Lost"] as const).map((status) => <Button variant="ghost" role="tab" id={`status-tab-${status}`} aria-selected={filter === status} aria-controls="inquiry-results" tabIndex={filter === status ? 0 : -1} className={filter === status ? "is-selected" : ""} key={status} onClick={() => setFilter(status)}>{status} <span>{statusCounts[status]}</span></Button>)}
    </div><div role="tabpanel" id="inquiry-results" aria-labelledby={`status-tab-${filter}`}><InquiryTable guests={filtered}/></div><p className="presentation-table-count">{filtered.length} inquiries</p>
  </Section>;
}
function WeeklyChart({ field, title, positive = false }: { field: "calls" | "bookings" | "revenue"; title: string; positive?: boolean }) {
  const max = Math.max(...weeks.map((w) => w[field]));
  return <div className={`presentation-weekly-chart ${positive ? "is-positive" : ""}`}><h3>{title}</h3><TooltipProvider delayDuration={100}><div className="presentation-bars" role="group" aria-label={`${title} by week`}>{weeks.map((week) => <Tooltip key={week.week}><TooltipTrigger asChild><div className="presentation-bar-column" tabIndex={0} role="img" aria-label={`${week.week} · ${title}: ${field === "revenue" ? money(week[field]) : week[field]}`}><strong>{field === "revenue" ? money(week[field]) : week[field]}</strong><div className="presentation-bar-space"><div className="presentation-bar" style={{ height: `${week[field] / max * 100}%` }} /></div><span>{week.week}</span></div></TooltipTrigger><TooltipContent className="presentation-chart-tooltip" side="top"><span>{week.week} · {title}</span><strong>{field === "revenue" ? money(week[field]) : week[field]}</strong></TooltipContent></Tooltip>)}</div></TooltipProvider></div>;
}
export function AnalyticsPresentation() {
  return <><Section id="weekly-trend"><div className="presentation-section-heading"><h2>Weekly trend</h2><p>Last 30 days</p></div><div className="presentation-chart-grid"><WeeklyChart field="calls" title="Calls"/><WeeklyChart field="bookings" title="Bookings" positive/><WeeklyChart field="revenue" title="Revenue" positive/></div>
    <div className="presentation-annotations"><p><span>W2</span>Includes 9-night Rooftop Suite, €4,860</p><p><span>W3</span>Rainy week, fewer walk-in calls</p></div>
    </Section><div className="presentation-analytics-bottom"><InquirySummary/><Section id="weekly-breakdown"><div className="presentation-section-heading"><h2>Weekly breakdown</h2></div><table className="presentation-week-table"><thead><tr><th>Week</th><th>Calls</th><th>Bookings</th><th>Revenue</th></tr></thead><tbody>{weeks.map((week) => <tr key={week.week}><td>{week.week}</td><td>{week.calls}</td><td>{week.bookings}</td><td>{money(week.revenue)}</td></tr>)}</tbody><tfoot><tr><td>Total</td><td>94</td><td>41</td><td>€38,642</td></tr></tfoot></table></Section></div></>;
}