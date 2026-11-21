import { useMemo, useState } from "react";
import {
  Phone,
  CalendarCheck2,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Sparkles,
  Check,
  X,
  Moon,
  BellRing,
  Download,
  ListFilter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDesk } from "./use-desk";
import { DeskShell, PageIntro } from "./shell";
import { Azulejo, TileDivider } from "./tile";
import { Priority, Status, InquiryDetails } from "./details";
import { euro } from "@/lib/night-desk/pricing";
import { initials, prioritized, shortDate, time, type Inquiry } from "@/lib/night-desk/types";
import { toast } from "sonner";
export function MorningDesk() {
  const desk = useDesk();
  const [days, setDays] = useState(60);
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");
  const [page, setPage] = useState(0);
  const end = useMemo(
    () =>
      Math.max(
        ...desk.inquiries.map((i) => Date.parse(i.created_at)),
        ...desk.bookings.map((b) => Date.parse(b.created_at)),
      ),
    [desk.inquiries, desk.bookings],
  );
  const inquiries = desk.inquiries.filter((i) => Date.parse(i.created_at) >= end - days * 86400000);
  const bookings = desk.bookings.filter((i) => Date.parse(i.created_at) >= end - days * 86400000);
  const recent = desk.inquiries.filter((i) => Date.parse(i.created_at) >= end - 1.5 * 86400000);
  const tasks = prioritized(recent);
  const overnightHours = [18, 20, 22, 0, 2, 4, 6].map((hour) => {
    const count = recent.filter((i) => {
      const callHour = Number(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          hourCycle: "h23",
          timeZone: "Europe/Lisbon",
        }).format(new Date(i.call_started_at || i.created_at)),
      );
      return callHour >= hour && callHour < hour + 2;
    }).length;
    return { hour, count };
  });
  const waiting = recent.filter(
    (i) => i.availability_status === "to confirm" && ["new", "contacted"].includes(i.status),
  ).length;
  const agentBookings = bookings.filter((b) => b.channel === "voice agent");
  const won = agentBookings.reduce((s, b) => s + b.total_value, 0);
  const risk = inquiries
    .filter((i) => ["new", "contacted"].includes(i.status))
    .reduce((s, i) => s + i.estimated_value, 0);
  const saved = bookings
    .filter((b) => b.commission_rate === 0)
    .reduce((s, b) => s + b.total_value * 0.18, 0);
  const filtered = inquiries.filter(
    (i) =>
      (filter === "all" || i.status === filter) &&
      (priority === "all" || i.priority === priority) &&
      `${i.guest_name} ${i.recommended_room} ${i.nationality}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / 8));
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(safePage * 8, safePage * 8 + 8);
  const kpis = [
    {
      label: "Concierge calls",
      value: inquiries.length,
      note: `${Math.round((inquiries.filter((i) => i.after_hours).length / Math.max(inquiries.length, 1)) * 100)}% received after hours`,
      icon: Phone,
      positive: false,
    },
    {
      label: "Confirmed bookings",
      value: bookings.length,
      note: `${agentBookings.length} from the voice concierge`,
      icon: CalendarCheck2,
      positive: false,
    },
    {
      label: "Revenue won by AI",
      value: euro(won),
      note: "Direct bookings, no commission",
      icon: TrendingUp,
      positive: true,
    },
    {
      label: "Revenue at risk",
      value: euro(risk),
      note: `${inquiries.filter((i) => ["new", "contacted"].includes(i.status)).length} guests still deciding`,
      icon: Clock,
      positive: false,
    },
    {
      label: "Commission saved",
      value: euro(saved),
      note: "vs. 18% platform commission",
      icon: ShieldCheck,
      positive: true,
    },
  ];
  async function status(i: Inquiry, s: string) {
    await desk.setStatus(i, s);
    setSelected((prev) =>
      prev?.id === i.id
        ? { ...prev, status: s, ...(s === "booked" ? { availability_status: "confirmed" } : {}) }
        : prev,
    );
  }
  function exportRows() {
    const csv = [
      "Guest,Room,Check-in,Nights,Value,Priority,Status",
      ...filtered.map((i) =>
        [
          i.guest_name,
          i.recommended_room,
          i.check_in,
          i.nights,
          i.estimated_value,
          i.priority,
          i.status,
        ]
          .map((v) => `"${String(v).replaceAll('"', '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "casa-lisboa-inquiries.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Inquiry report downloaded");
  }
  return (
    <DeskShell page="Morning Desk">
      <PageIntro
        eyebrow="Your morning, beautifully organized"
        title="Good morning, Casa Lisboa."
        subtitle="Here's what happened overnight. A few thoughtful calls can make all the difference."
        days={days}
        onDays={(n) => {
          setDays(n);
          setPage(0);
        }}
      />
      {desk.error && (
        <p role="alert" className="form-message mb-4">
          Hotel records could not be loaded. Showing fictional case data.
        </p>
      )}
      <div className="alarm">
        <span className="alarm-icon">
          <BellRing size={18} />
        </span>
        <div>
          <p className="alarm-title">
            {waiting} guests are waiting for availability confirmation. Call them first.
          </p>
          <p className="alarm-description">
            Last night's conversations are this morning's opportunities. Let's give them a warmer
            welcome.
          </p>
        </div>
        <Button
          variant="sunset"
          size="sm"
          className="alarm-action"
          onClick={() =>
            document.getElementById("morning-calls")?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Start morning calls
          <ArrowRight />
        </Button>
      </div>
      <div className="kpi-grid">
        {kpis.map((k) => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-top">
              <span>{k.label}</span>
              <k.icon className="kpi-icon" />
            </div>
            <div className="kpi-value">{k.value}</div>
            <div className={`kpi-note ${k.positive ? "positive" : ""}`}>
              {k.positive && <ArrowUpRight size={11} />} {k.note}
            </div>
            <Azulejo className="kpi-corner" />
          </div>
        ))}
      </div>
      <div className="morning-grid" id="morning-calls">
        <section>
          <div className="section-heading">
            <div className="section-title">
              <h2>A little follow-up. A lot of possibility.</h2>
              <span className="small-count">{tasks.length}</span>
            </div>
            <span className="section-note">
              <ListFilter size={12} />
              Priority, then value
            </span>
          </div>
          <div className="task-list">
            {tasks.slice(0, expanded ? 20 : 3).map((i) => (
              <article className="task-item" key={i.id}>
                <span className="avatar">{initials(i.guest_name)}</span>
                <div>
                  <div className="task-title">
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs font-semibold text-foreground"
                      onClick={() => setSelected(i)}
                    >
                      {i.guest_name}
                    </Button>
                    <Priority value={i.priority} />
                  </div>
                  <p className="task-meta">
                    {i.nationality} · {i.recommended_room} · {i.nights} nights ·{" "}
                    {shortDate(i.check_in)}
                  </p>
                  <p className="task-line hesitation">
                    <CircleHelp />
                    {i.hesitation_reason}
                  </p>
                  <p className="task-line winback">
                    <Sparkles />
                    {i.win_back_action}
                  </p>
                  <p className="task-line mt-1">
                    <Clock />
                    {i.next_step}
                  </p>
                </div>
                <div className="task-actions">
                  <div>
                    <div className="task-value">{euro(i.estimated_value)}</div>
                    <div className="task-deadline">
                      <Clock size={10} />
                      {i.next_step_deadline ? `By ${time(i.next_step_deadline)}` : "This morning"}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-[10px]"
                      disabled={desk.saving === i.id}
                      onClick={() => status(i, "contacted")}
                    >
                      <Phone className="size-3" />
                      {i.status === "contacted" ? "Contacted" : "Contact"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-6"
                      aria-label={`Mark ${i.guest_name} booked`}
                      title="Mark booked"
                      disabled={desk.saving === i.id}
                      onClick={() => status(i, "booked")}
                    >
                      <Check className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-6"
                      aria-label={`Mark ${i.guest_name} lost`}
                      title="Mark lost"
                      disabled={desk.saving === i.id}
                      onClick={() => status(i, "lost")}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
            {!tasks.length && (
              <div className="empty-state">
                <Azulejo className="mx-auto size-12" />
                <h3>A lovely start to the day.</h3>
                <p>All of last night's guests have been followed up.</p>
              </div>
            )}
          </div>
          {tasks.length > 3 && (
            <Button
              variant="link"
              className="mt-2 h-8 p-0 text-[11px]"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show fewer guests" : `View all ${tasks.length} morning follow-ups`}
              <ArrowRight size={12} />
            </Button>
          )}
        </section>
        <aside className="overnight">
          <TilePatternCorner />
          <div className="flex items-center gap-2 text-gold mb-3">
            <Moon size={14} />
            <span className="eyebrow text-gold">The overnight story</span>
          </div>
          <h3>
            While Lisbon slept,
            <br />
            we kept the door open.
          </h3>
          <p>Guest conversations, from dusk to dawn.</p>
          <div className="overnight-chart">
            {overnightHours.map(({ hour, count }) => (
              <div className="hour-col" key={hour} title={`${count} calls`}>
                <div
                  className="hour-bar"
                  style={{
                    height: `${Math.max(4, (count / Math.max(...overnightHours.map((h) => h.count), 1)) * 62)}px`,
                  }}
                />
                <span className="hour-label">{String(hour).padStart(2, "0")}:00</span>
              </div>
            ))}
          </div>
          <div className="overnight-figure">
            <strong>{recent.length}</strong>
            <span>guests welcomed overnight</span>
          </div>
          <div className="overnight-figure mt-1">
            <strong className="text-[28px]">
              {euro(recent.reduce((s, i) => s + i.estimated_value, 0))}
            </strong>
            <span>in potential stays</span>
          </div>
          <div className="overnight-footer">
            <span>One thoughtful extra per stay.</span>
            <Sparkles size={15} className="text-gold" />
          </div>
        </aside>
      </div>
      <TileDivider />
      <section className="inquiry-section" id="all-inquiries">
        <div className="section-heading">
          <div className="section-title">
            <h2>Every conversation. Every opportunity.</h2>
            <span className="small-count">{inquiries.length}</span>
          </div>
          <Button variant="ghost" size="sm" className="text-[10px]" onClick={exportRows}>
            <Download size={12} />
            Export
          </Button>
        </div>
        <div className="table-tools">
          <div className="filter-tabs">
            {["all", "new", "contacted", "booked", "lost"].map((s) => (
              <Button
                key={s}
                variant="ghost"
                size="sm"
                className={`h-7 text-[10px] px-3 capitalize ${s === filter ? "selected" : ""}`}
                onClick={() => {
                  setFilter(s);
                  setPage(0);
                }}
              >
                {s === "all" ? "All inquiries" : s}
                {s === "new" && (
                  <span className="small-count">
                    {inquiries.filter((i) => i.status === "new").length}
                  </span>
                )}
              </Button>
            ))}
          </div>
          <div className="table-filters">
            <label className="search-field">
              <Search />
              <input
                aria-label="Search inquiries"
                placeholder="Search guests, rooms…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
            </label>
            <select
              className="period-control"
              aria-label="Filter inquiry priority"
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(0);
              }}
            >
              <option value="all">All priorities</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
          </div>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>GUEST</th>
                <th>STAY</th>
                <th>RECOMMENDED ROOM</th>
                <th>VALUE</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr
                  key={i.id}
                  className={`${i.status === "new" ? "new-row" : ""} ${desk.highlight === i.id ? "new-highlight" : ""}`}
                >
                  <td>
                    <div className="guest-cell">
                      <span className="avatar">{initials(i.guest_name)}</span>
                      <div>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-foreground guest-name"
                          onClick={() => setSelected(i)}
                        >
                          {i.guest_name}
                        </Button>
                        <div className="guest-sub">
                          {i.nationality} · {i.language}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      {shortDate(i.check_in)} – {shortDate(i.check_out)}
                    </div>
                    <div className="guest-sub">
                      {i.nights} nights · {i.adults} adults
                      {i.children ? ` · ${i.children} children` : ""}
                    </div>
                  </td>
                  <td>
                    <div>{i.recommended_room}</div>
                    <div className="guest-sub">{i.recommended_extra}</div>
                  </td>
                  <td className="font-semibold tabular-nums">{euro(i.estimated_value)}</td>
                  <td>
                    <Priority value={i.priority} />
                  </td>
                  <td>
                    <Status value={i.status} />
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      aria-label={`Open ${i.guest_name} inquiry`}
                      onClick={() => setSelected(i)}
                    >
                      <ChevronRight className="size-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <div className="empty-state">
              <Search className="mx-auto" />
              <h3>No matching conversations.</h3>
              <p>Try a different guest name or filter.</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                  setPriority("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
        <div className="table-footer">
          <span>
            Showing {filtered.length ? safePage * 8 + 1 : 0}–
            {Math.min((safePage + 1) * 8, filtered.length)} of {filtered.length} inquiries
          </span>
          <div className="pagination">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label="Previous inquiry page"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              <ChevronLeft />
            </Button>
            <span>
              {safePage + 1} / {pageCount}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label="Next inquiry page"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(safePage + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </section>
      <InquiryDetails
        inquiry={selected}
        onClose={() => setSelected(null)}
        onStatus={status}
        saving={desk.saving}
      />
    </DeskShell>
  );
}
function TilePatternCorner() {
  return <Azulejo className="absolute -right-8 -top-8 size-28 opacity-[0.06]" />;
}
