import { useState } from "react";
import { Search, Clock, ArrowRight, MessagesSquare, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDesk } from "./use-desk";
import { DeskShell, PageIntro } from "./shell";
import { Priority, Status, Transcript, InquiryDetails } from "./details";
import { shortDate, time, transcriptMessages, type Inquiry } from "@/lib/night-desk/types";
import { euro } from "@/lib/night-desk/pricing";
export function TranscriptsPage() {
  const desk = useDesk();
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("all");
  const [priority, setPriority] = useState("all");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<Inquiry | null>(null);
  const filtered = desk.inquiries.filter(
    (i) =>
      (language === "all" || i.language === language) &&
      (priority === "all" || i.priority === priority) &&
      (status === "all" || i.status === status) &&
      (!date || i.created_at.slice(0, 10) === date) &&
      `${i.guest_name} ${i.summary} ${transcriptMessages(i.transcript)
        .map((m) => m.text)
        .join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const selected = filtered.find((i) => i.id === selectedId) ?? filtered[0];
  const languages = [
    ...new Set(desk.inquiries.map((i) => i.language).filter((s): s is string => Boolean(s))),
  ];
  return (
    <DeskShell page="Transcripts">
      <PageIntro
        eyebrow="The voice behind every inquiry"
        title="The conversation starts here."
        subtitle="Every guest has a story. Listen to what matters, and pick up where we left off."
      />
      <div className="section-heading">
        <div className="section-title">
          <h2>Guest conversations</h2>
          <span className="small-count">{filtered.length}</span>
        </div>
        <span className="section-note">
          <MessagesSquare size={12} />
          Voice concierge
        </span>
      </div>
      <div className="table-tools">
        <label className="search-field">
          <Search />
          <input
            aria-label="Search conversations"
            placeholder="Search names or conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="table-filters">
          <input
            aria-label="Filter conversation date"
            type="date"
            className="period-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <select
            className="period-control"
            aria-label="Filter conversation language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="all">All languages</option>
            {languages.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <select
            className="period-control"
            aria-label="Filter conversation priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="all">All priorities</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
          <select
            className="period-control"
            aria-label="Filter conversation status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            {["new", "contacted", "booked", "lost"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      {selected ? (
        <div className="transcript-layout">
          <div className="conversation-list">
            {filtered.map((i) => (
              <Button
                variant="conversation"
                key={i.id}
                className={`conversation-card ${i.id === selected.id ? "selected" : ""}`}
                onClick={() => setSelectedId(i.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <h4>{i.guest_name}</h4>
                  <Priority value={i.priority} />
                </div>
                <p>
                  {i.recommended_room} · {i.nights} nights
                  <br />
                  {i.reason_for_stay} · {euro(i.estimated_value)}
                </p>
                <div className="conversation-meta">
                  <span>
                    {shortDate(i.created_at)} · {time(i.created_at)}
                  </span>
                  <span>{i.language}</span>
                </div>
              </Button>
            ))}
          </div>
          <section className="conversation-panel">
            <div className="conversation-header">
              <div>
                <div className="eyebrow mb-2">
                  {shortDate(selected.created_at)} · {time(selected.created_at)} Lisbon
                </div>
                <h2>{selected.guest_name}</h2>
                <div className="flex items-center gap-3 mt-3">
                  <Status value={selected.status} />
                  <span className="section-note">
                    <Globe size={11} />
                    {selected.language}
                  </span>
                  <span className="section-note">
                    <Clock size={11} />
                    {Math.floor((selected.call_duration_sec ?? 0) / 60)} min
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setDetail(selected)}>
                Inquiry
                <ArrowRight />
              </Button>
            </div>
            <p className="detail-copy mt-5">{selected.summary}</p>
            <Transcript inquiry={selected} />
          </section>
        </div>
      ) : (
        <div className="empty-state">
          <MessagesSquare className="mx-auto" />
          <h3>No matching conversations.</h3>
          <Button
            variant="link"
            onClick={() => {
              setSearch("");
              setLanguage("all");
              setPriority("all");
              setStatus("all");
              setDate("");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
      <InquiryDetails
        inquiry={detail}
        onClose={() => setDetail(null)}
        onStatus={desk.setStatus}
        saving={desk.saving}
      />
    </DeskShell>
  );
}
