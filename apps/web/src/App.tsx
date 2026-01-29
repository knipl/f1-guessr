import { mockDrivers, mockGroup, mockNextRace, mockVotesTable } from './mockData';
import './index.css';

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

export default function App() {
  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="tag">F1 Guessr</p>
          <h1>{mockGroup.name}</h1>
          <p className="sub">Predict the top 10 before Q1. Edit until lock.</p>
        </div>
        <div className="race-card">
          <p className="label">Next race</p>
          <h2>{mockNextRace.name}</h2>
          <p className="meta">{mockNextRace.circuit}</p>
          <div className="times">
            <div>
              <span>Q1</span>
              <strong>{formatDate(mockNextRace.q1StartTime)}</strong>
            </div>
            <div>
              <span>Race</span>
              <strong>{formatDate(mockNextRace.raceStartTime)}</strong>
            </div>
          </div>
        </div>
      </header>

      <section className="card">
        <div className="card-head">
          <h2>Your vote (mock)</h2>
          <button className="primary">Edit picks</button>
        </div>
        <div className="grid">
          {mockDrivers.map((driver, index) => (
            <div key={driver} className="pick">
              <span className="pos">P{index + 1}</span>
              <span>{driver}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
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
