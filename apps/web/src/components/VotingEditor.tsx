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

export default function VotingEditor({ drivers, ranking, locked, onSave }: VotingEditorProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localRanking, setLocalRanking] = useState(() => normalizeRanking(drivers, ranking));

  const usedDrivers = useMemo(
    () => new Set(localRanking.filter(Boolean)),
    [localRanking]
  );

  const canSave =
    localRanking.length === 10 &&
    new Set(localRanking).size === 10 &&
    localRanking.every((value) => value);

  const handleSelect = (index: number, value: string) => {
    setLocalRanking((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(localRanking);
    setSaving(false);
    setEditing(false);
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

      <div className="grid">
        {localRanking.map((driver, index) => (
          <div key={`${index}-${driver}`} className="pick">
            <span className="pos" data-testid="vote-position">
              P{index + 1}
            </span>
            {editing ? (
              <select
                value={driver}
                onChange={(event) => handleSelect(index, event.target.value)}
              >
                {drivers.map((option) => (
                  <option
                    key={option}
                    value={option}
                    disabled={usedDrivers.has(option) && option !== driver}
                  >
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <span>{driver}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
