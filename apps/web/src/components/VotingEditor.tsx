import { useEffect, useMemo, useState } from 'react';

interface VotingEditorProps {
  drivers: { name: string; team?: string | null }[];
  ranking: string[];
  locked: boolean;
  onSave: (ranking: string[]) => Promise<void> | void;
}

function normalizeRanking(ranking: string[]) {
  return ranking.filter(Boolean).slice(0, 10);
}

function reorder<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export default function VotingEditor({ drivers, ranking, locked, onSave }: VotingEditorProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localRanking, setLocalRanking] = useState(() => normalizeRanking(ranking));
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const driverMap = useMemo(
    () => new Map(drivers.map((driver) => [driver.name, driver.team ?? null])),
    [drivers]
  );

  useEffect(() => {
    if (!editing) {
      setLocalRanking(normalizeRanking(ranking));
    }
  }, [editing, ranking]);

  const usedDrivers = useMemo(() => new Set(localRanking.filter(Boolean)), [localRanking]);

  const canSave =
    localRanking.length === 10 &&
    new Set(localRanking).size === 10 &&
    localRanking.every((value) => value);

  const handleAdd = (driver: string) => {
    if (locked || !editing) return;
    setLocalRanking((prev) => {
      if (prev.includes(driver) || prev.length >= 10) return prev;
      return [...prev, driver];
    });
  };

  const handleRemove = (driver: string) => {
    if (locked || !editing) return;
    setLocalRanking((prev) => prev.filter((item) => item !== driver));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(localRanking);
    setSaving(false);
    setEditing(false);
  };

  const handleDragOver = (index: number) => {
    if (locked || !editing || dragIndex === null || dragIndex === index) return;
    setLocalRanking((prev) => reorder(prev, dragIndex, index));
    setDragIndex(index);
  };

  const startDrag = (index: number) => {
    if (locked || !editing) return;
    setDragIndex(index);
  };

  const handleDrop = (index: number) => {
    if (locked || !editing || dragIndex === null) return;
    setLocalRanking((prev) => reorder(prev, dragIndex, index));
    setDragIndex(null);
  };

  const getTeamBadge = (driverName: string) => {
    const team = driverMap.get(driverName);
    if (!team) return null;
    const badge = teamBadge(team);
    return (
      <span className="team-badge" style={{ background: badge.color }} title={team}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="vote-editor">
      <div className="card-head">
        <div>
          <h2>Your vote</h2>
          <p className="sub">{locked ? 'Voting locked at Q1 start.' : 'Voting open until Q1.'}</p>
        </div>
        <div className="vote-actions">
          {!editing && (
            <button className="primary" disabled={locked} onClick={() => setEditing(true)}>
              {locked ? 'Locked' : 'Edit picks'}
            </button>
          )}
          {editing && (
            <button className="primary" onClick={handleSave} disabled={!canSave || saving}>
              {saving ? 'Saving…' : 'Save picks'}
            </button>
          )}
          {editing && (
            <button className="secondary" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="vote-columns">
        <div className="vote-column">
          <h3>Top 10</h3>
          <div className="vote-list">
            {localRanking.map((driver, index) => (
              <div
                key={`${driver}-${index}`}
                className={`vote-item ${dragIndex === index ? 'dragging' : ''}`}
                draggable={!locked && editing}
                onDragStart={() => startDrag(index)}
                onDragOver={(event) => {
                  event.preventDefault();
                  handleDragOver(index);
                }}
                onDrop={() => handleDrop(index)}
                onDragEnd={() => setDragIndex(null)}
                data-testid="vote-item"
              >
                <span className="pos" data-testid="vote-position">
                  P{index + 1}
                </span>
                <span className="handle" aria-hidden>
                  ⋮⋮
                </span>
                <span className="driver-name">
                  {driver}
                  {getTeamBadge(driver)}
                </span>
                {editing && !locked && (
                  <button className="ghost" onClick={() => handleRemove(driver)} aria-label={`Remove ${driver}`}>
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="vote-column">
          <h3>Pick drivers</h3>
          <p className="muted">Tap to add to your top 10. Drag to reorder.</p>
          <div className="pill-grid">
            {drivers.map((driver) => (
              <button
                key={driver.name}
                className={`pill ${usedDrivers.has(driver.name) ? 'selected' : ''}`}
                onClick={() => handleAdd(driver.name)}
                disabled={
                  !editing || locked || usedDrivers.has(driver.name) || localRanking.length >= 10
                }
              >
                {driver.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function teamBadge(team: string) {
  const key = team.toLowerCase();
  const map: Record<string, { label: string; color: string }> = {
    mercedes: { label: 'MER', color: '#00D2BE' },
    ferrari: { label: 'FER', color: '#DC0000' },
    'red bull racing': { label: 'RED', color: '#060193ff' },
    mclaren: { label: 'MCL', color: '#FF8700' },
    'aston martin': { label: 'AST', color: '#006F62' },
    alpine: { label: 'ALP', color: '#FF87BC' },
    williams: { label: 'WIL', color: '#005AFF' },
    'haas f1 team': { label: 'HAA', color: '#5a5a5aff' },
    'racing bulls': { label: 'RAC', color: '#2B4562' },
    audi: { label: 'AUD', color: '#c3c3c3ff' },
    cadillac: { label: 'CAD', color: '#151515ff' },
  };

  return map[key] ?? { label: team.slice(0, 3).toUpperCase(), color: '#3b3f48' };
}
