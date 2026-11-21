import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Phone, Check, X, Mail, Clock, Sparkles } from "lucide-react";
import { priceStay, rooms, euro, type Room } from "@/lib/night-desk/pricing";
import {
  shortDate,
  time,
  initials,
  transcriptMessages,
  type Inquiry,
} from "@/lib/night-desk/types";
export function Priority({ value }: { value: string }) {
  return (
    <span className={`priority ${value}`}>
      <span className="priority-dot" />
      {value}
    </span>
  );
}
export function Status({ value }: { value: string }) {
  return (
    <span className={`status ${value}`}>
      <span className="priority-dot" />
      {value}
    </span>
  );
}
export function Transcript({ inquiry }: { inquiry: Inquiry }) {
  return (
    <div className="transcript-messages">
      {transcriptMessages(inquiry.transcript).map((m, i) => (
        <div className={`message ${m.speaker.toLowerCase()}`} key={i}>
          <span className="avatar">
            {m.speaker === "Agent" ? <Sparkles size={13} /> : initials(inquiry.guest_name)}
          </span>
          <div>
            <div className="message-heading">
              <strong>
                {m.speaker === "Agent" ? "Casa Lisboa concierge" : inquiry.guest_name}
              </strong>
              <small>{m.timestamp}</small>
            </div>
            <p className="message-text">{m.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
export function InquiryDetails({
  inquiry,
  onClose,
  onStatus,
  saving,
}: {
  inquiry: Inquiry | null;
  onClose: () => void;
  onStatus: (i: Inquiry, s: string) => Promise<void>;
  saving: string;
}) {
  if (!inquiry) return null;
  const room =
    inquiry.recommended_room in rooms ? (inquiry.recommended_room as Room) : "Classic Double";
  const quote = priceStay(
    room,
    inquiry.check_in,
    inquiry.check_out,
    inquiry.extras_interested ?? [],
  );
  const facts = [
    ["Contact", inquiry.contact],
    ["Nationality", inquiry.nationality],
    ["Language", inquiry.language],
    ["Guest profile", `${inquiry.age ?? "–"} years · ${inquiry.gender ?? "Not specified"}`],
    ["Check-in", `${shortDate(inquiry.check_in)} · ${inquiry.preferred_check_in_time}`],
    ["Check-out", `${shortDate(inquiry.check_out)} · ${inquiry.preferred_check_out_time}`],
    ["Party", `${inquiry.adults} adults · ${inquiry.children} children`],
    ["Occasion", inquiry.reason_for_stay],
    ["Arrival", inquiry.arrival_time],
    ["Availability", inquiry.availability_status],
    ["Requested room", inquiry.room_requested],
    ["Budget", inquiry.budget ? euro(inquiry.budget) : "Not specified"],
  ];
  return (
    <Sheet
      open={Boolean(inquiry)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="detail-sheet">
        <div className="eyebrow">Guest inquiry · {shortDate(inquiry.created_at)}</div>
        <SheetTitle>{inquiry.guest_name}</SheetTitle>
        <SheetDescription>
          {inquiry.type_of_holiday} stay · {inquiry.nights} nights · Voice concierge
        </SheetDescription>
        <div className="detail-meta">
          <Priority value={inquiry.priority} />
          <Status value={inquiry.status} />
          {inquiry.after_hours && (
            <span className="section-note">
              <Clock size={12} />
              After hours
            </span>
          )}
        </div>
        <div className="detail-section">
          <h3>Guest & stay details</h3>
          <dl className="detail-grid">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || "Not specified"}</dd>
              </div>
            ))}
          </dl>
          {inquiry.special_requests && (
            <p className="detail-copy mt-4">{inquiry.special_requests}</p>
          )}
        </div>
        <div className="detail-section">
          <h3>{room}</h3>
          <p className="detail-copy mb-4">
            {rooms[room].size} m² · {rooms[room].description}
          </p>
          <div className="price-breakdown">
            {quote.nightly.every((n) => n.rate === quote.nightly[0]?.rate) ? (
              <div className="price-line">
                <span>
                  {quote.nights} nights × {euro(quote.nightly[0]?.rate ?? 0)}
                  {quote.nightly.some((n) => n.summer) ? " · High season +20%" : ""}
                </span>
                <span>{euro(quote.roomTotal)}</span>
              </div>
            ) : (
              quote.nightly.map((n) => (
                <div className="price-line" key={n.date}>
                  <span>
                    {shortDate(n.date)} {n.summer ? "· High season" : ""}
                  </span>
                  <span>{euro(n.rate)}</span>
                </div>
              ))
            )}
            {quote.extraLines.map((e) => (
              <div className="price-line" key={e.name}>
                <span>
                  {e.name}
                  {e.name === "Bike rental" ? ` · ${quote.nights} days` : ""}
                </span>
                <span>{e.value ? euro(e.value) : "Complimentary"}</span>
              </div>
            ))}
            <div className="price-line">
              <span>Rooftop welcome drink · Direct booking</span>
              <span>Included</span>
            </div>
            <div className="price-line price-total">
              <span>Estimated stay value</span>
              <span>{euro(quote.total)}</span>
            </div>
          </div>
          <p className="section-note mt-3">
            <Check size={12} />
            Hotel rates calculated · Availability to be confirmed
          </p>
        </div>
        <div className="detail-section">
          <h3>A warmer way to win them back</h3>
          <div className="detail-highlight">
            <div className="eyebrow mb-2">Why they hesitated</div>
            <p>{inquiry.hesitation_reason}</p>
            <div className="eyebrow mt-4 mb-2">Your next move</div>
            <p>{inquiry.win_back_action}</p>
          </div>
          <p className="detail-copy mt-4">
            {inquiry.next_step}
            {inquiry.next_step_deadline
              ? ` · ${shortDate(inquiry.next_step_deadline)}, ${time(inquiry.next_step_deadline)}`
              : ""}
          </p>
          <div className="detail-actions">
            <Button disabled={saving === inquiry.id} onClick={() => onStatus(inquiry, "contacted")}>
              <Phone />
              Mark contacted
            </Button>
            <Button
              variant="outline"
              disabled={saving === inquiry.id}
              onClick={() => onStatus(inquiry, "booked")}
            >
              <Check />
              Mark booked
            </Button>
            <Button
              variant="ghost"
              disabled={saving === inquiry.id}
              onClick={() => onStatus(inquiry, "lost")}
            >
              <X />
              Lost
            </Button>
            <Button variant="ghost" asChild>
              <a
                href={
                  inquiry.contact.includes("@")
                    ? `mailto:${inquiry.contact}`
                    : `tel:${inquiry.contact}`
                }
              >
                <Mail />
                Contact guest
              </a>
            </Button>
          </div>
        </div>
        <div className="detail-section">
          <h3>Conversation summary</h3>
          <p className="detail-copy">{inquiry.summary}</p>
        </div>
        <div className="detail-section">
          <h3>Full conversation</h3>
          <p className="section-note">
            {inquiry.call_duration_sec
              ? `${Math.floor(inquiry.call_duration_sec / 60)}m ${inquiry.call_duration_sec % 60}s`
              : ""}{" "}
            · {inquiry.language}
          </p>
          <Transcript inquiry={inquiry} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
