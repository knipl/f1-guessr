import { useEffect, useMemo, useState } from 'react';
import { useRaceSessions } from '../api/hooks';
import type { DriverInfo, Race } from '../api/hooks';

interface AdminResultsEditorProps {
  races: Race[];
  drivers: DriverInfo[];
  onSubmit: (raceId: string, positions: string[]) => Promise<void> | void;
  onSaveSession: (raceId: string, type: 'practice' | 'qualifying' | 'race', startTime: string) => Promise<void> | void;
}

function reorder<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export default function AdminResultsEditor({
  races,
  drivers,
  onSubmit,
  onSaveSession
}: AdminResultsEditorProps) {
  const [selectedRaceId, setSelectedRaceId] = useState(() => races[0]?.id ?? '');
  const [positions, setPositions] = useState<string[]>(() =>
    drivers.length > 0 ? drivers.map((driver) => driver.name) : []
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<'practice' | 'qualifying' | 'race'>('practice');
  const [sessionTime, setSessionTime] = useState('');
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: sessions } = useRaceSessions(selectedRaceId, refreshKey);

  useEffect(() => {
    if (!selectedRaceId && races.length > 0) {
      setSelectedRaceId(races[0].id);
    }
  }, [races, selectedRaceId]);

  useEffect(() => {
    if (positions.length === 0 && drivers.length > 0) {
      setPositions(drivers.map((driver) => driver.name));
    }
  }, [drivers, positions.length]);

  const selectedRace = useMemo(
    () => races.find((race) => race.id === selectedRaceId) ?? null,
    [races, selectedRaceId]
  );

  const canSubmit = Boolean(selectedRaceId) && positions.length >= 10 && !saving;

  const handleDragOver = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    setPositions((prev) => reorder(prev, dragIndex, index));
    setDragIndex(index);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setStatus(null);
    setError(null);
    try {
      await onSubmit(selectedRaceId, positions);
      setStatus('Results saved. Race finalized.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save results.');
    } finally {
      setSaving(false);
    }
  };

  const handleSessionSave = async () => {
    if (!selectedRaceId || !sessionTime) return;
    setSessionStatus(null);
    setSessionError(null);
    try {
      const isoTime = new Date(sessionTime).toISOString();
      await onSaveSession(selectedRaceId, sessionType, isoTime);
      setSessionStatus('Session saved.');
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setSessionError(err instanceof Error ? err.message : 'Failed to save session.');
    }
  };

  const formatLocal = (value: string) =>
    new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(value)
    );

  return (
    <div className="admin-editor" data-testid="admin-tools">
      <div className="card-head">
        <div>
          <h2>Admin tools</h2>
          <p className="sub">Enter the official order once the race ends.</p>
        </div>
        <button className="primary" disabled={!canSubmit} onClick={handleSubmit}>
          {saving ? 'Saving…' : 'Finalize results'}
        </button>
      </div>

      <div className="admin-grid">
        <label className="admin-field">
          <span>Race</span>
          <select
            value={selectedRaceId}
            onChange={(event) => setSelectedRaceId(event.target.value)}
          >
            {races.map((race) => (
              <option key={race.id} value={race.id}>
                {race.name}
                {race.status ? ` · ${race.status}` : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          <span>Session type</span>
          <select value={sessionType} onChange={(event) => setSessionType(event.target.value as any)}>
            <option value="practice">Practice</option>
            <option value="qualifying">Qualifying</option>
            <option value="race">Race</option>
          </select>
        </label>
        <label className="admin-field">
          <span>Session time (local)</span>
          <input
            type="datetime-local"
            value={sessionTime}
            onChange={(event) => setSessionTime(event.target.value)}
          />
        </label>
        <button className="secondary" onClick={handleSessionSave} disabled={!selectedRaceId || !sessionTime}>
          Save session
        </button>
        <div className="admin-help">
          <p>Drag to reorder. Only P1–P10 affect points.</p>
          <p>Current race: {selectedRace?.name ?? 'Select a race'}</p>
        </div>
      </div>

      <div className="vote-list admin-list">
        {positions.map((driver, index) => (
          <div
            key={`${driver}-${index}`}
            className={`vote-item ${dragIndex === index ? 'dragging' : ''}`}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => {
              event.preventDefault();
              handleDragOver(index);
            }}
            onDrop={() => setDragIndex(null)}
            onDragEnd={() => setDragIndex(null)}
          >
            <span className="pos">P{index + 1}</span>
            <span className="handle" aria-hidden>
              ⋮⋮
            </span>
            <span>{driver}</span>
          </div>
        ))}
      </div>

      <div className="admin-sessions">
        <h3>Sessions</h3>
        <div className="table">
          <div className="table-row header">
            <span>Type</span>
            <span>Start (local)</span>
          </div>
          {(sessions ?? []).length === 0 ? (
            <div className="table-row">
              <span>No sessions yet.</span>
              <span>—</span>
            </div>
          ) : (
            (sessions ?? []).map((session) => (
              <div key={session.id} className="table-row">
                <span>{session.type}</span>
                <span>{formatLocal(session.startTime)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {status && <p className="admin-status success">{status}</p>}
      {error && <p className="admin-status error">{error}</p>}
      {sessionStatus && <p className="admin-status success">{sessionStatus}</p>}
      {sessionError && <p className="admin-status error">{sessionError}</p>}
    </div>
  );
}
