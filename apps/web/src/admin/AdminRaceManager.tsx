import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { createRace, deleteRace, updateRace, useAdminRaces } from '../api/hooks';

const emptyForm = {
  season: '',
  round: '',
  name: '',
  circuit: '',
  q1StartTime: '',
  raceStartTime: '',
  status: 'scheduled'
};

function toLocalInputValue(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function AdminRaceManager() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: races, loading, error } = useAdminRaces(refreshKey);
  const sortedRaces = useMemo(() => {
    if (!races) return [];
    return [...races].sort((a, b) => {
      const aTime = a.q1StartTime ? new Date(a.q1StartTime).getTime() : 0;
      const bTime = b.q1StartTime ? new Date(b.q1StartTime).getTime() : 0;
      return aTime - bTime;
    });
  }, [races]);
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [didChooseRace, setDidChooseRace] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const selectedRace = useMemo(
    () => races?.find((race) => race.id === selectedRaceId) ?? null,
    [races, selectedRaceId]
  );

  useEffect(() => {
    if (!didChooseRace && !selectedRaceId && races && races.length > 0) {
      setSelectedRaceId(races[0].id);
    }
  }, [didChooseRace, races, selectedRaceId]);

  useEffect(() => {
    if (!selectedRace) {
      if (!selectedRaceId) {
        setForm(emptyForm);
      }
      return;
    }
    setForm({
      season: String(selectedRace.season ?? ''),
      round: String(selectedRace.round ?? ''),
      name: selectedRace.name ?? '',
      circuit: selectedRace.circuit ?? '',
      q1StartTime: toLocalInputValue(selectedRace.q1StartTime),
      raceStartTime: toLocalInputValue(selectedRace.raceStartTime),
      status: selectedRace.status ?? 'scheduled'
    });
    // Keep Q1 time in form for editing; no separate qualifying session editor.
  }, [selectedRace, selectedRaceId]);

  const handleChange = (field: keyof typeof form) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const resetForm = () => {
    setSelectedRaceId('');
    setDidChooseRace(true);
    setForm(emptyForm);
  };

  const handleCreate = async () => {
    setMessage(null);
    setErr(null);
    try {
      const payload = {
        season: Number(form.season),
        round: Number(form.round),
        name: form.name,
        circuit: form.circuit,
        q1StartTime: new Date(form.q1StartTime).toISOString(),
        raceStartTime: new Date(form.raceStartTime).toISOString(),
        status: form.status
      };
      await createRace(payload);
      setMessage('Race created.');
      setRefreshKey((value) => value + 1);
      resetForm();
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Failed to create race.');
    }
  };

  const handleUpdate = async () => {
    if (!selectedRaceId) return;
    setMessage(null);
    setErr(null);
    try {
      await updateRace(selectedRaceId, {
        season: Number(form.season),
        round: Number(form.round),
        name: form.name,
        circuit: form.circuit,
        q1StartTime: new Date(form.q1StartTime).toISOString(),
        raceStartTime: new Date(form.raceStartTime).toISOString(),
        status: form.status
      });
      setMessage('Race updated.');
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Failed to update race.');
    }
  };

  const handleDelete = async () => {
    if (!selectedRaceId) return;
    setMessage(null);
    setErr(null);
    try {
      await deleteRace(selectedRaceId);
      setMessage('Race deleted.');
      setRefreshKey((value) => value + 1);
      resetForm();
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Failed to delete race.');
    }
  };

  const formatLocal = (value?: string) => {
    if (!value) return '—';
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  };

  return (
    <section className="card">
      <div className="card-head">
        <div>
          <h2>Race management</h2>
          <p className="sub">Create, edit, or remove races and qualifying sessions.</p>
        </div>
      </div>

      {loading && <p className="sub">Loading races…</p>}
      {error && <p className="notice error">{error}</p>}

      <div className="admin-grid">
        <label className="admin-field">
          <span>Existing races</span>
          <select
            value={selectedRaceId}
            onChange={(event) => {
              setSelectedRaceId(event.target.value);
              setDidChooseRace(true);
            }}
          >
            <option value="">New race</option>
            {sortedRaces.map((race) => (
              <option key={race.id} value={race.id}>
                {race.name} · {race.season}R{race.round}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          <span>Status</span>
          <select value={form.status} onChange={handleChange('status')}>
            <option value="scheduled">Scheduled</option>
            <option value="locked">Locked</option>
            <option value="finalized">Finalized</option>
          </select>
        </label>
        <label className="admin-field">
          <span>Season</span>
          <input type="number" value={form.season} onChange={handleChange('season')} />
        </label>
        <label className="admin-field">
          <span>Round</span>
          <input type="number" value={form.round} onChange={handleChange('round')} />
        </label>
        <label className="admin-field">
          <span>Race name</span>
          <input value={form.name} onChange={handleChange('name')} />
        </label>
        <label className="admin-field">
          <span>Circuit</span>
          <input value={form.circuit} onChange={handleChange('circuit')} />
        </label>
        <label className="admin-field">
          <span>Q1 start (local)</span>
          <input type="datetime-local" value={form.q1StartTime} onChange={handleChange('q1StartTime')} />
        </label>
        <label className="admin-field">
          <span>Race start (local)</span>
          <input type="datetime-local" value={form.raceStartTime} onChange={handleChange('raceStartTime')} />
        </label>
      </div>

      <div className="vote-actions">
        <button className="primary" onClick={selectedRaceId ? handleUpdate : handleCreate}>
          {selectedRaceId ? 'Update race' : 'Create race'}
        </button>
        {selectedRaceId && (
          <button className="secondary" onClick={handleDelete}>
            Delete race
          </button>
        )}
      </div>

      {message && <p className="notice success">{message}</p>}
      {err && <p className="notice error">{err}</p>}

      <div className="admin-sessions">
        <h3>All races</h3>
        <div className="table">
          <div className="table-row header">
            <span>Race</span>
            <span>Q1 (local)</span>
            <span>Race start (local)</span>
            <span>Status</span>
          </div>
          {sortedRaces.length === 0 ? (
            <div className="table-row four">
              <span>No races yet.</span>
              <span>—</span>
              <span>—</span>
              <span>—</span>
            </div>
          ) : (
            sortedRaces.map((race) => (
              <div key={race.id} className="table-row four">
                <span>{race.name}</span>
                <span>{formatLocal(race.q1StartTime)}</span>
                <span>{formatLocal(race.raceStartTime)}</span>
                <span>{race.status}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
