# UI Progress Notes

## What’s implemented (mock + API wired)
- Next race hero card pulls from API and renders in local time.
- Voting UX with driver pills to add to top‑10 and drag‑and‑drop reordering.
- Group selector appears only when multiple groups exist.
- Season standings and group results fetch from API (fallback to mock data).
- Drivers list fetches from API (fallback to mock data).
- Race history and achievements still mocked.
- Invite-only banner shown when not signed in (auth UI hidden).

## Assumptions
- Drivers list uses OpenF1 data (last name) if available.
- API endpoints require auth; when missing, UI falls back to mock data.
- Voting lock computed from `q1StartTime`.

## Next UI steps (later)
- Add group invite join flow UI.
- Add vote success/error toasts.
