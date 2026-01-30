# UI Progress Notes

## What’s implemented (mock + API wired)
- Next race hero card pulls from API and renders in local time.
- Voting card with editable top‑10 list and lock countdown.
- Group selector appears only when multiple groups exist.
- Season standings and group results fetch from API (fallback to mock data).
- Race history and achievements still mocked.
- Invite-only banner shown when not signed in (auth UI hidden).

## Assumptions
- Drivers list is mocked until a drivers endpoint exists.
- API endpoints require auth; when missing, UI falls back to mock data.
- Voting lock computed from `q1StartTime`.

## Next UI steps (later)
- Replace mocked drivers with real drivers list from API.
- Build vote reordering UX (drag/drop or smarter selector).
- Add group invite join flow UI.
