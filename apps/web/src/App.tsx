import { useEffect, useMemo, useState } from 'react';
import InviteNotice from './components/InviteNotice';
import AuthCard from './auth/AuthCard';
import { supabase } from './auth/supabaseClient';
import VotingEditor from './components/VotingEditor';
import AdminRaceManager from './admin/AdminRaceManager';
import AdminGroupsPage from './admin/AdminGroupsPage';
import AdminInviteManager from './admin/AdminInviteManager';
import JoinPage from './groups/JoinPage';
import { useSupabaseSession } from './auth/useSupabaseSession';
import {
  Group,
  useDefaultGroup,
  useDrivers,
  useGroupResults,
  useGroups,
  useMyVote,
  useNextRace,
  useStandings,
  submitVote
} from './api/hooks';
import {
  mockAchievements,
  mockDrivers,
  mockRaceHistory,
  mockStandings,
  mockVotesTable
} from './mockData';
import './index.css';

function formatDate(value?: string) {
  if (!value) return 'TBD';
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function formatCountdown(target?: Date) {
  if (!target) return 'Loading..';
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return 'Locked';

  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function resolveGroupName(groups: Group[] | null) {
  if (!groups || groups.length === 0) return 'Your Group';
  if (groups.length === 1) return groups[0].name;
  return 'Multiple Groups';
}

export default function App() {
  if (window.location.pathname.startsWith('/admin')) {
    if (window.location.pathname === '/admin/groups') {
      return <AdminGroupsPage />;
    }
    if (window.location.pathname === '/admin/invites') {
      return <AdminInviteManager />;
    }
    return <AdminRaceManager />;
  }
  if (window.location.pathname.startsWith('/join/')) {
    const token = window.location.pathname.replace('/join/', '');
    return <JoinPage token={token} />;
  }

  const { session } = useSupabaseSession();
  const { data: groups } = useGroups();
  const { data: defaultGroup } = useDefaultGroup();
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const { data: nextRace } = useNextRace();
  const isTestingSession =
    nextRace && 'date_start' in nextRace && !('raceStartTime' in nextRace);
  const race = !isTestingSession ? (nextRace as any) : null;
  const { data: driversData, loading: driversLoading } = useDrivers();
  const [voteRefreshKey, setVoteRefreshKey] = useState(0);
  const [optimisticVote, setOptimisticVote] = useState<string[] | null>(null);
  const { data: standings } = useStandings(activeGroupId ?? undefined);
  const { data: vote, loading: voteLoading } = useMyVote(
    race?.id,
    activeGroupId ?? undefined,
    voteRefreshKey
  );
  const { data: groupResults } = useGroupResults(race?.id, activeGroupId ?? undefined);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!activeGroupId && groups && groups.length > 0) {
      setActiveGroupId(groups[0].id);
    }
    if (!activeGroupId && defaultGroup) {
      setActiveGroupId(defaultGroup.id);
    }
  }, [activeGroupId, defaultGroup, groups]);

  const q1Start = useMemo(() => (race ? new Date(race.q1StartTime) : undefined), [race]);
  const [countdown, setCountdown] = useState(() => formatCountdown(q1Start));

  useEffect(() => {
    const id = window.setInterval(() => {
      setCountdown(formatCountdown(q1Start));
    }, 2_000);

    return () => window.clearInterval(id);
  }, [q1Start]);

  const isLocked = countdown === 'Locked';

  const groupName = resolveGroupName(groups ?? null);
  const driverOptions =
    driversData?.map((driver) => ({ name: driver.name, team: driver.team })) ?? mockDrivers;
  const ranking = optimisticVote ?? vote?.ranking ?? [];
  const showVoteLoading = driversLoading || (race && voteLoading);

  useEffect(() => {
    if (vote) {
      setOptimisticVote(null);
    }
  }, [vote]);

  const handleSaveVote = async (rankingDraft: string[]) => {
    if (!race || !activeGroupId) return;
    setOptimisticVote(rankingDraft);
    await submitVote({
      raceId: race.id,
      groupId: activeGroupId,
      ranking: rankingDraft
    });
    setVoteRefreshKey((value) => value + 1);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setLoggingOut(false);
  };


  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="tag">F1 Guessr</p>
          <div className="group-row">
            <h1>{groupName}</h1>
            {groups && groups.length > 1 && (
              <select
                value={activeGroupId ?? ''}
                onChange={(event) => setActiveGroupId(event.target.value)}
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="sub-row">
            <p className="sub">Predict the top 10 before Q1. Edit until lock.</p>
            {session && (
              <button className="secondary" onClick={handleLogout} disabled={loggingOut}>
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            )}
          </div>
        </div>
        <div className="race-card">
          <p className="label">Next race</p>
          <h2>{race?.name ?? (isTestingSession ? 'Pre‑season testing' : 'No upcoming race')}</h2>
          <p className="meta">{race?.circuit ?? (isTestingSession ? 'Bahrain International Circuit' : 'Check back soon')}</p>
          <div className="times">
            <div>
              <span>Q1 (local)</span>
              <strong>{formatDate(race?.q1StartTime)}</strong>
            </div>
            <div>
              <span>Race (local)</span>
              <strong>{formatDate(race?.raceStartTime)}</strong>
            </div>
          </div>
          {isTestingSession ? (
            <div className="testing-block">
              <span>Pre‑season testing</span>
              <div className="testing-dates">
                <strong>{formatDate((nextRace as any).date_start)}</strong>
              </div>
            </div>
          ) : null}
          <div className="lock-row">
            <span>Voting locks in</span>
            <strong>{countdown}</strong>
          </div>
        </div>
      </header>

      {!session && <InviteNotice />}
      {!session && <AuthCard />}

      <section className="card">
        {showVoteLoading ? (
          <div className="vote-editor">
            <div className="card-head">
              <div>
                <h2>Your vote</h2>
                <p className="sub">Loading your picks…</p>
              </div>
              <div className="vote-actions">
                <button className="primary" disabled>
                  Loading…
                </button>
              </div>
            </div>
            <div className="vote-columns">
              <div className="vote-column">
                <h3>Top 10</h3>
                <div className="vote-list">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="vote-item placeholder" aria-hidden="true">
                      <span className="pos">P{index + 1}</span>
                      <span className="handle">⋮⋮</span>
                      <span className="placeholder-line" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="vote-column">
                <h3>Pick drivers</h3>
                <p className="muted">Fetching drivers…</p>
                <div className="pill-grid">
                  {Array.from({ length: 20 }).map((_, index) => (
                    <div key={index} className="pill placeholder-pill" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <VotingEditor
            drivers={driverOptions}
            ranking={ranking}
            locked={isLocked}
            onSave={handleSaveVote}
          />
        )}
      </section>

      <section className="card" data-testid="season-standings">
        <div className="card-head">
          <h2>Season standings</h2>
          <span className="pill">After 3 races</span>
        </div>
        <div className="table">
          <div className="table-row header">
            <span>User</span>
            <span>Points</span>
            <span>Gap</span>
            <span>Δ</span>
          </div>
          {(standings ?? mockStandings).map((row: any) => (
            <div key={row.user ?? row.userId} className="table-row four">
              <span>{row.user ?? row.name}</span>
              <span>{row.points}</span>
              <span>{row.gap === 0 ? 'Leader' : `-${row.gap ?? 0}`}</span>
              <span>{row.change ?? '+0'}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card" data-testid="race-history">
        <div className="card-head">
          <h2>Race history</h2>
          <span className="pill">Latest results</span>
        </div>
        <div className="table">
          <div className="table-row header">
            <span>Race</span>
            <span>Score</span>
            <span>Position</span>
          </div>
          {mockRaceHistory.map((row) => (
            <div key={row.race} className="table-row three">
              <span>{row.race}</span>
              <span>{row.score}</span>
              <span>#{row.position}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card" data-testid="achievements">
        <div className="card-head">
          <h2>Achievements</h2>
          <span className="pill">Unlocked</span>
        </div>
        <div className="chips">
          {mockAchievements.map((achievement) => (
            <div key={achievement.title} className="chip">
              <strong>{achievement.title}</strong>
              <span>{achievement.detail}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card" data-testid="group-results">
        <div className="card-head">
          <h2>Group results (after race)</h2>
          <span className="pill">Finalized</span>
        </div>
        <div className="table">
          <div className="table-row header">
            <span>User</span>
            <span>Top 10 picks</span>
            <span>Score</span>
          </div>
          {(groupResults ?? mockVotesTable).map((row: any) => (
            <div key={row.user?.id ?? row.user} className="table-row">
              <span>{row.user?.displayName ?? row.user?.email ?? row.user}</span>
              <span className="picks">{row.picks?.join(' · ') ?? '—'}</span>
              <span className="score">{row.points ?? row.score}</span>
            </div>
          ))}
        </div>
      </section>

      {session && driversData ? (
        <section className="card" data-testid="admin-panel">
          <p className="sub">Admin tools are now available at /admin.</p>
        </section>
      ) : null}
    </main>
  );
}
