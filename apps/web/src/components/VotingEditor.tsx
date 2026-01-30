import { useMemo, useState } from 'react';

interface VotingEditorProps {
  drivers: string[];
  ranking: string[];
  locked: boolean;
  onSave: (ranking: string[]) => Promise<void> | void;
}

function normalizeRanking(drivers: string[], ranking: string[]) {
  const filled = [...ranking];
  for (const driver of drivers) {
    if (filled.length >= 10) break;
    if (!filled.includes(driver)) {
      filled.push(driver);
    }
  }
  return filled.slice(0, 10);
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
  const [localRanking, setLocalRanking] = useState(() => normalizeRanking(drivers, ranking));
  const [dragIndex, setDragIndex] = useState<number | null>(null);

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
                <span>{driver}</span>
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
                key={driver}
                className={`pill ${usedDrivers.has(driver) ? 'selected' : ''}`}
                onClick={() => handleAdd(driver)}
                disabled={!editing || locked || usedDrivers.has(driver) || localRanking.length >= 10}
              >
                {driver}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
