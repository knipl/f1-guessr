# API Progress Notes

## What’s implemented
- Prisma schema expanded with races, sessions, votes, results, scores, achievements.
- OpenF1 sync (cached) for race/qualifying times via sessions endpoint.
- Public races endpoints:
  - `GET /races` (list)
  - `GET /races/next`
  - `GET /races/:raceId/results?groupId=...`
  - `GET /races/standings?groupId=...`
- Authenticated endpoints:
  - `GET /votes/me?raceId=...&groupId=...`
  - `POST /votes` (upsert vote, locks at Q1 start)
- Admin endpoint:
  - `POST /admin/races/:raceId/results` (sets results, computes scores, finalizes race)

## Assumptions
- OpenF1 sessions are used to derive race start + qualifying start; meeting name uses location/country fallback.
- Group scoping is explicit via `groupId` query/body for now.
- Admin access is controlled by `ADMIN_EMAILS` env var (comma-separated).
- Scoring uses exact match only and F1 points for positions 1–10.

## Next API steps
- Add group context resolution (default to user’s only group).
- Add achievements awarding logic.
- Add standings rank change calculations.
- Add driver list endpoint (from OpenF1 or static seed).
