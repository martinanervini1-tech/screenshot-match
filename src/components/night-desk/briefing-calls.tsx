import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/night-desk/presentation-data";
import type { BriefingCall } from "@/lib/night-desk/briefing-state";

export function BriefingCalls({ calls, handledIds = [], onHandled, onNavigate }: {
  calls: BriefingCall[];
  handledIds?: readonly string[];
  onHandled?: (id: string, handled: boolean) => void;
  onNavigate: () => void;
}) {
  return <ol>{calls.map((guest) => {
    const handled = handledIds.includes(guest.id);
    const resolved = guest.intent === "Resolved";
    return <li className="briefing-call" key={guest.id} data-handled={handled || resolved}>
      <time>{guest.time}</time>
      <div className="briefing-call-info"><strong>{guest.name}</strong><p>{resolved ? guest.note : `${guest.nights} nights · ${guest.dates} · ${guest.room}. ${guest.note}`}</p>
        {!resolved && <Button asChild variant="link" className="briefing-open-call"><Link to="/follow-ups" search={{ call: guest.id }} onClick={onNavigate}>Open call<ArrowUpRight /></Link></Button>}
      </div>
      <div className="briefing-call-outcome"><span className="briefing-intent">{handled ? "Handled" : guest.intent}</span>{!resolved && <strong>{money(guest.value)}</strong>}
        {onHandled && !resolved && <Button variant="ghost" size="icon" className="briefing-handle" aria-label={`${handled ? "Reopen" : "Mark handled"}: ${guest.name}`} title={handled ? "Reopen follow-up" : "Mark as handled"} onClick={() => onHandled(guest.id, !handled)}>{handled ? <Undo2 /> : <Check />}</Button>}
      </div>
    </li>;
  })}</ol>;
}