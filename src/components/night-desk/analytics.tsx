import { useMemo, useState, type ReactNode } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Moon,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { useDesk } from "./use-desk";
import { DeskShell, PageIntro } from "./shell";
import { TileDivider, Azulejo } from "./tile";
import { Button } from "@/components/ui/button";
import { euro, housekeeping } from "@/lib/night-desk/pricing";
import { shortDate } from "@/lib/night-desk/types";
const colors = [
  "var(--primary)",
  "var(--sunset)",
  "var(--destructive)",
  "var(--tile-blue)",
  "var(--gold)",
  "var(--border)",
];
function counts(values: (string | null)[]) {
  const count: Record<string, number> = {};
  for (const v of values) {
    const key = v || "Not specified";
    count[key] = (count[key] ?? 0) + 1;
  }
  return Object.entries(count)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="analytics-panel">
      <h3>{title}</h3>
      <p className="chart-subtitle">{subtitle}</p>
      {children}
    </section>
  );
}
function MetricList({
  values,
  money = false,
}: {
  values: { name: string; value: number }[];
  money?: boolean;
}) {
  const max = Math.max(...values.map((v) => v.value), 1);
  return (
    <div className="metric-list">
      {values.map((v) => (
        <div className="metric-row-wrap" key={v.name}>
          <div className="metric-row">
            <span className="capitalize">{v.name}</span>
            <strong>{money ? euro(v.value) : v.value}</strong>
          </div>
          <div className="metric-track">
            <div className="metric-fill" style={{ width: `${(v.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  fontSize: "11px",
  color: "var(--foreground)",
};
export function AnalyticsPage() {
  const desk = useDesk();
  const [days, setDays] = useState(60);
  const [week, setWeek] = useState(0);
  const end = useMemo(
    () =>
      Math.max(
        ...desk.inquiries.map((i) => Date.parse(i.created_at)),
        ...desk.bookings.map((b) => Date.parse(b.created_at)),
      ),
    [desk.inquiries, desk.bookings],
  );
  const inquiries = desk.inquiries.filter((i) => Date.parse(i.created_at) >= end - days * 86400000);
  const bookings = desk.bookings.filter((b) => Date.parse(b.created_at) >= end - days * 86400000);
  const agent = bookings.filter((b) => b.channel === "voice agent");
  const direct = bookings.filter((b) => b.commission_rate === 0);
  const platforms = bookings.filter((b) => b.commission_rate > 0);
  const revenue = agent.reduce((s, b) => s + b.total_value, 0);
  const risk = inquiries
    .filter((i) => ["new", "contacted"].includes(i.status))
    .reduce((s, i) => s + i.estimated_value, 0);
  const commissionPaid = platforms.reduce((s, b) => s + b.commission_cost, 0);
  const commissionSaved = direct.reduce((s, b) => s + b.total_value * 0.18, 0);
  const after = Math.round(
    (inquiries.filter((i) => i.after_hours).length / Math.max(inquiries.length, 1)) * 100,
  );
  const period = Math.max(1, Math.ceil(days / 8));
  const trend = Array.from({ length: Math.ceil(days / period) }, (_, index) => {
    const start = end - days * 86400000 + index * period * 86400000;
    const stop = start + period * 86400000;
    return {
      name: shortDate(new Date(start).toISOString()),
      Calls: inquiries.filter(
        (i) => Date.parse(i.created_at) >= start && Date.parse(i.created_at) < stop,
      ).length,
      Bookings: bookings.filter(
        (b) => Date.parse(b.created_at) >= start && Date.parse(b.created_at) < stop,
      ).length,
    };
  });
  const hourly = Array.from({ length: 24 }, (_, h) => ({
    name: String(h).padStart(2, "0"),
    Calls: inquiries.filter(
      (i) =>
        Number(
          new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",
            hourCycle: "h23",
            timeZone: "Europe/Lisbon",
          }).format(new Date(i.call_started_at || i.created_at)),
        ) === h,
    ).length,
    Bookings: bookings.filter(
      (b) =>
        Number(
          new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",
            hourCycle: "h23",
            timeZone: "Europe/Lisbon",
          }).format(new Date(b.created_at)),
        ) === h,
    ).length,
  }));
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((name, n) => ({
    name,
    Calls: inquiries.filter((i) => new Date(i.created_at).getUTCDay() === n).length,
    Bookings: bookings.filter((b) => new Date(b.created_at).getUTCDay() === n).length,
  }));
  const channelData = counts(bookings.map((b) => b.channel));
  const decision = channelData.map((c) => {
    const b = bookings.filter((b) => b.channel === c.name && b.decision_time_minutes !== null);
    return {
      name:
        c.name === "phone office hours"
          ? "Phone"
          : c.name === "voice agent"
            ? "Voice AI"
            : c.name === "other platform"
              ? "Other OTA"
              : c.name,
      value: Math.round(
        b.reduce((s, b) => s + (b.decision_time_minutes ?? 0), 0) / Math.max(b.length, 1),
      ),
    };
  });
  const lead = bookings.map((b) =>
    Math.max(0, Math.round((Date.parse(b.check_in) - Date.parse(b.created_at)) / 86400000)),
  );
  const leadData = [
    { name: "0–3 days", value: lead.filter((n) => n <= 3).length },
    { name: "4–7 days", value: lead.filter((n) => n > 3 && n <= 7).length },
    { name: "8–14 days", value: lead.filter((n) => n > 7 && n <= 14).length },
    { name: "15–30 days", value: lead.filter((n) => n > 14 && n <= 30).length },
    { name: "31+ days", value: lead.filter((n) => n > 30).length },
  ];
  const ages = bookings.map((b) => b.age).filter((n): n is number => n !== null);
  const ageData = [
    { name: "18–29", value: ages.filter((a) => a < 30).length },
    { name: "30–39", value: ages.filter((a) => a >= 30 && a < 40).length },
    { name: "40–49", value: ages.filter((a) => a >= 40 && a < 50).length },
    { name: "50–59", value: ages.filter((a) => a >= 50 && a < 60).length },
    { name: "60+", value: ages.filter((a) => a >= 60).length },
  ];
  const base = new Date(new Date(end).toISOString().slice(0, 10) + "T00:00:00Z");
  const timeline = Array.from({ length: 7 }, (_, j) => {
    const date = new Date(base.getTime() + (j + week * 7) * 86400000).toISOString().slice(0, 10);
    const departures = desk.bookings.filter((b) => b.check_out === date).length;
    const late = desk.inquiries.filter(
      (i) =>
        i.check_out === date &&
        i.preferred_check_out_time &&
        i.preferred_check_out_time > "11:00" &&
        i.status !== "lost",
    ).length;
    const early = desk.inquiries.filter(
      (i) =>
        i.check_in === date &&
        i.preferred_check_in_time &&
        i.preferred_check_in_time < "15:00" &&
        i.status !== "lost",
    ).length;
    return { date, departures, late, early, ...housekeeping(departures, late, early) };
  });
  const kpis = [
    {
      title: "AI-attributed revenue",
      value: euro(revenue),
      note: `${agent.length} direct bookings`,
      icon: TrendingUp,
    },
    {
      title: "After-hours share",
      value: `${after}%`,
      note: `${inquiries.filter((i) => i.after_hours).length} of ${inquiries.length} calls`,
      icon: Moon,
    },
    {
      title: "Commission saved",
      value: euro(commissionSaved),
      note: `${euro(commissionPaid)} paid to platforms`,
      icon: ShieldCheck,
    },
    {
      title: "Inquiry conversion",
      value: `${Math.round((inquiries.filter((i) => i.status === "booked").length / Math.max(inquiries.length, 1)) * 100)}%`,
      note: `${inquiries.filter((i) => i.status === "booked").length} converted inquiries`,
      icon: CheckCircle2,
    },
    {
      title: "Revenue at risk",
      value: euro(risk),
      note: "Open inquiries, not yet converted",
      icon: Clock,
    },
  ];
  return (
    <DeskShell page="Analytics">
      <PageIntro
        eyebrow="A clearer picture of your business"
        title="Small hotel. Meaningful insights."
        subtitle="The conversations, channels and guest preferences shaping Casa Lisboa."
        days={days}
        onDays={setDays}
      />
      <div className="kpi-grid">
        {kpis.map((k) => (
          <div className="kpi-card" key={k.title}>
            <div className="kpi-top">
              <span>{k.title}</span>
              <k.icon className="kpi-icon" />
            </div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-note">{k.note}</div>
            <Azulejo className="kpi-corner" />
          </div>
        ))}
      </div>
      <div className="section-heading">
        <div className="section-title">
          <h2>From conversation to reservation.</h2>
        </div>
        <span className="section-note">
          {inquiries.length} calls · {bookings.length} bookings
        </span>
      </div>
      <div className="analytics-grid">
        <Panel
          title="The reservations rhythm"
          subtitle="Concierge calls and bookings across all channels"
        >
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="Bookings"
                  stroke="var(--sunset)"
                  fill="var(--peach)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="Calls"
                  stroke="var(--primary)"
                  fill="var(--secondary)"
                  strokeWidth={2}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel
          title="Direct relationships. Less commission."
          subtitle={`${Math.round((direct.length / Math.max(bookings.length, 1)) * 100)}% direct bookings · ${Math.round((platforms.length / Math.max(bookings.length, 1)) * 100)}% through platforms`}
        >
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={86}
                  paddingAngle={3}
                >
                  {channelData.map((v, j) => (
                    <Cell key={v.name} fill={colors[j % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel
          title="When guests reach out"
          subtitle={`Lisbon time · ${after}% of calls outside 09:00–18:00`}
        >
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly} margin={{ left: -25, right: 0 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" interval={2} axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="Calls" fill="var(--primary)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Bookings" fill="var(--sunset)" radius={[2, 2, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel
          title="A quicker yes"
          subtitle="Average minutes from first contact to booking, by channel"
        >
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={decision} layout="vertical" margin={{ left: 10, right: 15 }}>
                <CartesianGrid stroke="var(--border)" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={72}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="Minutes" radius={[0, 3, 3, 0]}>
                  {decision.map((v, j) => (
                    <Cell key={v.name} fill={colors[j % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      <TileDivider />
      <div className="section-heading">
        <h2 className="text-[27px]">The stays they're dreaming of.</h2>
        <span className="section-note">Rooms, occasions & little extras</span>
      </div>
      <div className="analytics-grid">
        <Panel title="A room for every kind of stay" subtitle="Booked room preferences">
          <MetricList values={counts(bookings.map((b) => b.room))} />
        </Panel>
        <Panel
          title="The thoughtful little extras"
          subtitle="Extras included in confirmed bookings"
        >
          <MetricList values={counts(bookings.flatMap((b) => b.extras ?? []))} />
        </Panel>
        <Panel title="Planning ahead" subtitle="Days between reservation and arrival">
          <MetricList values={leadData} />
        </Panel>
        <Panel title="Stay a little longer" subtitle="Number of nights per confirmed booking">
          <MetricList
            values={counts(bookings.map((b) => `${b.nights} nights`)).sort((a, b) =>
              a.name.localeCompare(b.name),
            )}
          />
        </Panel>
        <Panel
          title="Reasons to celebrate, reasons to travel"
          subtitle="Guest occasions across confirmed bookings"
        >
          <MetricList values={counts(bookings.map((b) => b.reason_for_stay))} />
        </Panel>
        <Panel title="Which days get busy?" subtitle="Calls and bookings by day of the week">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekday} margin={{ left: -25 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="Calls" fill="var(--primary)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Bookings" fill="var(--sunset)" radius={[3, 3, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      <TileDivider />
      <div className="section-heading">
        <h2 className="text-[27px]">Getting to know your guests.</h2>
        <span className="section-note">Fictional marketing insights</span>
      </div>
      <div className="analytics-grid">
        <Panel title="A world of guests" subtitle="Top nationalities in confirmed bookings">
          <MetricList values={counts(bookings.map((b) => b.nationality)).slice(0, 7)} />
        </Panel>
        <Panel title="Their kind of Lisbon" subtitle="Holiday types in confirmed bookings">
          <MetricList values={counts(bookings.map((b) => b.type_of_holiday))} />
        </Panel>
        <Panel title="Age groups" subtitle="Guest age at the time of booking">
          <MetricList values={ageData} />
        </Panel>
        <Panel title="Guest demographics" subtitle="Gender, as provided by the guest">
          <MetricList values={counts(bookings.map((b) => b.gender))} />
        </Panel>
        <Panel title="Why they paused" subtitle="Hesitation reasons across concierge inquiries">
          <MetricList values={counts(inquiries.map((i) => i.hesitation_reason))} />
        </Panel>
        <Panel
          title="Every opportunity has a temperature"
          subtitle="Priority mix and average estimated value per inquiry"
        >
          <MetricList values={counts(inquiries.map((i) => i.priority))} />
          <div className="price-line price-total mt-6">
            <span>Average inquiry value</span>
            <span>
              {euro(
                inquiries.reduce((s, i) => s + i.estimated_value, 0) /
                  Math.max(inquiries.length, 1),
              )}
            </span>
          </div>
        </Panel>
      </div>
      <section className="housekeeping-section">
        <div className="housekeeping-top">
          <div>
            <h2>A smooth handover, room by room.</h2>
            <p>45 min per room · 4 housekeepers · Standard window 11:00–15:00</p>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous housekeeping week"
              onClick={() => setWeek(week - 1)}
            >
              <ChevronLeft />
            </Button>
            <span className="section-note">
              <CalendarDays size={13} />
              {shortDate(timeline[0]?.date ?? base.toISOString())}–
              {shortDate(timeline[6]?.date ?? base.toISOString())}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next housekeeping week"
              onClick={() => setWeek(week + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
        {timeline.map((d) => (
          <div className="housekeeping-day" key={d.date}>
            <div>
              <strong>{shortDate(d.date)}</strong>
              <small>
                {d.departures} departures · {d.early} early arrivals
              </small>
            </div>
            <div>
              <div className="timeline">
                <div className="timeline-clean" style={{ width: `${d.late ? 75 : 100}%` }}>
                  {d.cleaningMinutes} min cleaning
                </div>
                {d.late > 0 && <div className="timeline-late flex-1">{d.late} late out</div>}
              </div>
              <div className="timeline-labels">
                <span>11:00</span>
                <span>12:00</span>
                <span>13:00</span>
                <span>14:00</span>
                <span>15:00</span>
              </div>
            </div>
            <span className={`turnaround ${d.tight ? "tight" : ""}`}>
              {d.tight ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}{" "}
              {d.tight ? "Tight turnaround" : `${d.utilization}% capacity used`}
            </span>
          </div>
        ))}
      </section>
    </DeskShell>
  );
}
