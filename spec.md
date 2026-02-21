# F1 Guessing Game – Functional Specification

## 1. Goals
- Let users predict top‑10 finish order before qualifying starts.
- Lock predictions at Q1 start time.
- Show all users’ votes only after the race is finalized.
- Provide post‑race standings with points, gaps, and position change.
- Provide admin overrides for all critical data.

## 2. Tech Stack
- Frontend: React.
- Backend: TypeScript using a maintainable framework.

### Backend framework recommendation
- **NestJS (TypeScript)** for structured modules, DI, validation, and long‑term maintainability.
  - Pros: strong conventions, great for API + scheduled jobs, easy testing.
  - Alternatives: **Fastify + Zod** (lighter), or **tRPC + Prisma** (type‑safe if you want end‑to‑end types).

## 3. Data Sources
- Primary schedule/results: **Jolpica (Ergast replacement)**.
- Live data: **not required** for this version.
- Admin panel supports manual entry of all race/session data if API fails.

## 4. Users & Permissions
- **Guest**: view next race info and public post‑race tables.
- **Authenticated user**: vote, edit vote before lock, view own history.
- **Admin**: manage races, lock/unlock voting, enter official results, trigger re‑scoring.
- **Group admin**: manages a private friend group (membership + settings).
- **Group creation**: only admins can create groups (users cannot create their own groups).

## 5. Core User Stories
1. As a user, I see the next race name, circuit, and session times.
2. As a user, I can submit a top‑10 prediction before Q1 starts.
3. As a user, I can edit my prediction until Q1 starts.
4. As a user, I see my vote immediately after submitting.
5. As a user, I see all users’ votes only after the race is finalized.
6. As a user, I can view standings and history for previous races.
7. As a user, I can join or create a group to keep votes and standings separate.
8. As a user, I can join a group using an invite link.

## 6. Functional Requirements

### 6.1 Next Race & Session Times
- Show next GP name, circuit, and session schedule.
- Use Jolpica schedule data; cache locally.
- If API fails, admin can input race + session times manually.

### 6.2 Voting
- Vote is ordered positions P1–P10.
- One vote per user per race.
- Vote edits allowed until Q1 start time.
- After lock: vote is read‑only.
- Votes are scoped to a **group** (default group if none selected).

### 6.3 Visibility Rules
- Before race finalized: users can see only their own vote.
- After race finalized: show a full table of all users’ votes and scores.
- Visibility is **within the same group only**.
- Groups are **hidden** from users who belong to a single group; no group switcher is shown.

### 6.4 Scoring
- Exact position match only.
- Points are based on official F1 points:
  - P1=25, P2=18, P3=15, P4=12, P5=10, P6=8, P7=6, P8=4, P9=2, P10=1
- Total race score = sum of points for exact matches.

### 6.5 Post‑Race Results & Standings
- After a configurable delay (default 2 hours) the race is finalized.
- Compute and display:
  - Per‑race scores
  - Season leaderboard
  - Position change vs previous race
  - Point gaps vs leader
- Provide a race history view with prior races.

### 6.6 Admin Panel
- CRUD races and qualifying sessions (via `/admin` route).
- Override session times (e.g., if schedule changes).
- Manually input or correct official race results.
- Trigger re‑scoring for a race or entire season.
- Toggle finalized state if needed.

### 6.7 Authentication
- Email/password and OAuth providers.
- Voting history tied to authenticated users.

### 6.8 Achievements (initial set)
- **Perfect 10**: all top‑10 correct.
- **Champion’s Pick**: P1 correct.
- **Podium Prophet**: top‑3 all correct.
- **Hot Streak**: top‑3 leaderboard position for 3 consecutive races.
- **Comeback**: improved leaderboard position by ≥5 between races.

## 7. Data Model (high‑level)
- **User**: id, email, display_name, auth_provider, role
- **Group**: id, name, owner_id, created_at
- **GroupMember**: group_id, user_id, role (member/admin), joined_at
- **GroupInvite**: id, group_id, token, expires_at, created_by
- **Race**: id, season, round, name, circuit, sessions[]
- **Session**: race_id, type (FP/Quali/Race), start_time
- **Vote**: user_id, race_id, group_id, ranking[10], updated_at
- **Result**: race_id, final_positions[20], updated_at
- **Score**: user_id, race_id, group_id, points, rank_change
- **Achievement**: user_id, code, race_id, awarded_at

## 8. System Behavior
- Voting lock is automated at Q1 start time.
- If the Q1 time changes, update lock time and notify users.
- Cache API responses and use admin overrides when needed.

## 9. Non‑Functional Requirements
- Reliable voting lock and audit logs for edits.
- Reasonable latency for page loads (<2s typical).
- Mobile‑friendly UI.
- Data integrity checks when results are entered or updated.

## 9.1 Scoring & Standings Algorithm (draft)

### 9.1.1 Per‑Race Scoring
- Inputs:
  - Official race result positions P1–P10.
  - User vote positions P1–P10.
- Scoring rules:
  - Only exact position matches score points.
  - Points by position: P1=25, P2=18, P3=15, P4=12, P5=10, P6=8, P7=6, P8=4, P9=2, P10=1.
- Algorithm:
  1) Initialize `score = 0`.
  2) For each position `pos` in 1..10:
     - If `vote[pos] == result[pos]`, add points for `pos`.
  3) Store `score` as the user’s race score.
- Edge cases:
  - If a race is not finalized, do not compute or display scores.
  - If the official result is updated (penalties), recompute all race scores.

### 9.1.2 Season Standings
- Inputs:
  - Per‑race scores for each user (only finalized races).
- Algorithm:
  1) For each user, sum all finalized race scores to get `total_points`.
  2) Sort users by `total_points` descending.
  3) Tie‑breakers:
     1. Higher number of exact P1 matches across finalized races.
     2. Higher number of exact P2 matches, then P3, ... P10.
     3. Most recent race score (higher wins).
     4. If still tied, shared position.
- Output fields:
  - `rank`, `user`, `total_points`, `gap_to_leader`, `position_change`.

### 9.1.3 Gaps & Position Change
- Gap to leader:
  - `gap = leader_total_points - user_total_points`.
- Position change (per race):
  1) Compute standings after previous finalized race.
  2) Compute standings after current finalized race.
  3) `position_change = previous_rank - current_rank`.
     - Positive value means moved up; negative means moved down.

### 9.1.4 Result Finalization Window
- Default finalization delay: 2 hours after race end.
- Admin can override finalization time or force re‑finalize if penalties occur.

## 10. API & Admin Flow Appendix (draft)

### 10.1 Public API (read‑only)
- `GET /api/next-race` → next race + session times.
- `GET /api/races` → list races (season, round, name, status).
- `GET /api/races/:raceId/standings` → season leaderboard after race finalization.
- `GET /api/races/:raceId/votes` → all votes table (only after race is finalized).

### 10.2 Authenticated API
- `POST /api/races/:raceId/vote` → create or replace vote (only before Q1 lock).
- `GET /api/me/votes` → voting history for current user.
- `GET /api/me/votes/:raceId` → current user’s vote for a race.

### 10.3 Admin API
- `POST /api/admin/races` → create race.
- `PATCH /api/admin/races/:raceId` → update race/session times/lock time.
- `POST /api/admin/races/:raceId/results` → set or replace official results.
- `POST /api/admin/races/:raceId/finalize` → finalize race and trigger scoring.
- `POST /api/admin/races/:raceId/recalculate` → recompute scores/standings.

### 10.4 Admin Panel Flow
- Create or import race schedule.
- Verify session times and lock times.
- When race ends, input official results or verify API import.
- Finalize race → scores + standings update.
- If penalties or changes occur, update results and recalculate.

## 11. Deployment (Render)

### 11.1 Services
- **Web**: Render Static Site.
- **API**: Render Web Service (Node 20+).
- **DB**: Render Postgres (free tier).

### 11.2 Build & Start Commands
- Web: `npm install` → `npm run -w @f1-guessr/web build`
- API: `npm install` → `npm run -w @f1-guessr/api build`
- API Start: `npm run -w @f1-guessr/api start`

### 11.3 Environment Variables
- `DATABASE_URL` for Postgres.
- `SESSION_SECRET` or equivalent for auth.
- `API_BASE_URL` for the web app (Render URL for the API).

### 11.4 Notes & Limits (Free Tier)
- Free web services can suspend after monthly usage caps.
- Builds are limited; avoid frequent redeploys.
- Use manual admin overrides if the schedule API is unavailable.
