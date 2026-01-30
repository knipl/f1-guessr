# API Progress Notes

## What’s implemented
- Prisma schema expanded with races, sessions, votes, results, scores, achievements.
- Races endpoints:
  - `GET /races` (list)
  - `GET /races/next`
  - `GET /races/:raceId/results?groupId=...`
  - `GET /races/standings?groupId=...`
- Votes endpoints:
  - `GET /votes/me?raceId=...&groupId=...`
  - `POST /votes` (upsert vote, locks at Q1 start)
- Admin endpoint:
  - `POST /admin/races/:raceId/results` (sets results, computes scores, finalizes race)

## Assumptions
- Group scoping is explicit via `groupId` query/body for now.
- Admin access is controlled by `ADMIN_EMAILS` env var (comma-separated).
- Scoring uses exact match only and F1 points for positions 1–10.

## Next API steps
- Add group context resolution (default to user’s only group).
- Add achievements awarding logic.
- Add standings rank change calculations.
- Add validation DTOs and error shaping.
