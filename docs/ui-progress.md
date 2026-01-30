# UI Progress Notes

## What’s implemented (mock UI)
- Next race hero card with local-time session display and a voting lock countdown.
- Voting card showing current top-10 picks with lock state.
- Season standings table with points, gaps, and position change.
- Race history table (per-race scores and finishing position).
- Achievements cards.
- Group results table (visible after race) with all users’ picks.

## Assumptions
- Times render in the user’s local time zone.
- Group selector is hidden when only one group exists (mock currently uses one group).
- Voting lock is computed from the Q1 start time.

## Next UI steps (later)
- Voting UX (drag/drop or ordered selection).
- Group selector for multi-group accounts.
- Admin panel surfaces (invite link, results overrides).
