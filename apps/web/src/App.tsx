import { useEffect, useMemo, useState } from 'react';
import {
  mockAchievements,
  mockDrivers,
  mockGroups,
  mockNextRace,
  mockRaceHistory,
  mockStandings,
  mockVotesTable
} from './mockData';
import './index.css';

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function formatCountdown(target: Date) {
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

export default function App() {
  const group = mockGroups[0];
  const q1Start = useMemo(() => new Date(mockNextRace.q1StartTime), []);
  const [countdown, setCountdown] = useState(() => formatCountdown(q1Start));

  useEffect(() => {
    const id = window.setInterval(() => {
      setCountdown(formatCountdown(q1Start));
    }, 60_000);

    return () => window.clearInterval(id);
  }, [q1Start]);

  const isLocked = countdown === 'Locked';

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="tag">F1 Guessr</p>
          <h1>{group.name}</h1>
          <p className="sub">Predict the top 10 before Q1. Edit until lock.</p>
        </div>
        <div className="race-card">
          <p className="label">Next race</p>
          <h2>{mockNextRace.name}</h2>
          <p className="meta">{mockNextRace.circuit}</p>
          <div className="times">
            <div>
              <span>Q1 (local)</span>
              <strong>{formatDate(mockNextRace.q1StartTime)}</strong>
            </div>
            <div>
              <span>Race (local)</span>
              <strong>{formatDate(mockNextRace.raceStartTime)}</strong>
            </div>
          </div>
          <div className="lock-row">
            <span>Voting locks in</span>
            <strong>{countdown}</strong>
          </div>
        </div>
      </header>

      <section className="card">
        <div className="card-head">
          <div>
            <h2>Your vote</h2>
            <p className="sub">{isLocked ? 'Voting locked at Q1 start.' : 'Voting open until Q1.'}</p>
          </div>
          <button className="primary" disabled={isLocked}>
            {isLocked ? 'Locked' : 'Edit picks'}
          </button>
        </div>
        <div className="grid">
          {mockDrivers.map((driver, index) => (
            <div key={driver} className="pick">
              <span className="pos" data-testid="vote-position">
                P{index + 1}
              </span>
              <span>{driver}</span>
            </div>
          ))}
        </div>
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
          {mockStandings.map((row) => (
            <div key={row.user} className="table-row four">
              <span>{row.user}</span>
              <span>{row.points}</span>
              <span>{row.gap === 0 ? 'Leader' : `-${row.gap}`}</span>
              <span>{row.change}</span>
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
          {mockVotesTable.map((row) => (
            <div key={row.user} className="table-row">
              <span>{row.user}</span>
              <span className="picks">{row.picks.join(' · ')}</span>
              <span className="score">{row.score}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
