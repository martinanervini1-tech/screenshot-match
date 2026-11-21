# Voice concierge → Night Desk

The concierge is external to this app. Publish the app before connecting it.

## Inquiry intake

Send JSON to `POST /api/public/inquiries` on the published app's domain. This is the framework's externally reachable equivalent of the requested `POST /inquiries` endpoint.

Include these headers:
- `Content-Type: application/json`
- `x-night-desk-timestamp`: Unix timestamp in seconds (within five minutes)
- `x-night-desk-signature`: lowercase hexadecimal HMAC-SHA256 of `<timestamp>.<exact raw JSON body>`, using the shared `NIGHT_DESK_WEBHOOK_SECRET` configured securely in both apps.

The endpoint accepts an optional UUID `id`; send a stable UUID for every conversation to make retries idempotent. Never copy staff session tokens into the voice service.

Example body (fictional):
```json
{
  "id": "a8fdc835-bb4d-45cf-a3e9-ffb22b1b01cb",
  "guest_name": "Sophie Miller",
  "contact": "sophie@example.com",
  "check_in": "2027-05-14",
  "check_out": "2027-05-17",
  "recommended_room": "Superior Balcony",
  "recommended_extra": "Celebration package",
  "extras_interested": ["Celebration package"],
  "adults": 2,
  "children": 0,
  "nationality": "United States",
  "language": "English",
  "type_of_holiday": "romantic",
  "reason_for_stay": "anniversary",
  "call_started_at": "2026-11-20T23:00:00Z",
  "call_ended_at": "2026-11-20T23:04:00Z",
  "priority": "hot",
  "hesitation_reason": "Wants confirmation of the balcony view",
  "win_back_action": "Send balcony photos and confirm availability",
  "next_step": "Confirm availability by 10:00",
  "next_step_deadline": "2026-11-21T10:00:00Z",
  "summary": "Anniversary couple would like a balcony and a little surprise.",
  "transcript": [{"speaker": "Guest", "text": "We would love a balcony.", "timestamp": "00:18"}]
}
```

Only the server computes nights, seasonal nightly rates, extras, call duration, and after-hours status. The example produces €711. Submitted prices, status, channel and demo flags are ignored. Successful requests return an ID, not guest details. Validation failures return 400; missing/invalid signatures return 401; duplicates with the same UUID are acknowledged without a second row.

## Staff access

Staff can create confirmed accounts and edit their own display name. New accounts have no hotel data access until explicitly approved. Assign `staff` or `admin` in the protected `user_roles` table through the Cloud data manager. Users cannot assign their own roles. The app exposes fictional demonstration data while signed out, and staff-only real records once an approved staff account is signed in.

## Follow-up and live updates

Changing an inquiry to booked atomically creates a direct voice-agent booking, with no commission and a measured decision time. Realtime invalidates the desk query on inquiry changes. Fictional follow-up actions while signed out are temporary demonstration changes; staff actions are saved.

The report reads the most recent 1,000 inquiries and bookings for approved staff. Increase this using paginated reads or aggregate reporting before the hotel grows beyond that reporting window.
