import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { createAdminGroup, useGroups } from '../api/hooks';

export default function AdminGroupsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: groups, loading, error: groupsError } = useGroups(refreshKey);
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setMessage(null);
    setError(null);
    try {
      await createAdminGroup(name.trim());
      setMessage('Group created.');
      setName('');
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group.');
    }
  };

  return (
    <AdminLayout title="Groups">
      <section className="card">
        <div className="card-head">
          <div>
            <h3>Create group</h3>
            <p className="sub">Only admins can create groups.</p>
          </div>
        </div>
        <div className="admin-grid">
          <label className="admin-field">
            <span>Group name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <button className="primary" onClick={handleCreate} disabled={!name.trim()}>
            Create group
          </button>
        </div>
        {message && <p className="notice success">{message}</p>}
        {error && <p className="notice error">{error}</p>}
      </section>

      <section className="card">
        <div className="card-head">
          <h3>Your groups</h3>
        </div>
        {loading ? (
          <p className="sub">Loading groups…</p>
        ) : (
          <div className="table">
            <div className="table-row header">
              <span>Name</span>
              <span>ID</span>
            </div>
            {(groups ?? []).length === 0 ? (
              <div className="table-row">
                <span>No groups yet.</span>
                <span>—</span>
              </div>
            ) : (
              (groups ?? []).map((group) => (
                <div key={group.id} className="table-row">
                  <span>{group.name}</span>
                  <span>{group.id}</span>
                </div>
              ))
            )}
          </div>
        )}
        {groupsError && <p className="notice error">{groupsError}</p>}
      </section>
    </AdminLayout>
  );
}
