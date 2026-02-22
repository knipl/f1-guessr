import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { createGroupInvite, useGroups } from '../api/hooks';

export default function AdminInviteManager() {
  const { data: groups } = useGroups();
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreateInvite = async () => {
    if (!selectedGroupId) return;
    setError(null);
    try {
      const invite = await createGroupInvite(selectedGroupId);
      const base = window.location.origin || window.location.href.replace(/\/$/, '');
      setInviteLink(`${base}/join/${invite.token}`);
      setExpiresAt(invite.expiresAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invite.');
    }
  };

  return (
    <AdminLayout title="Invites">
      <section className="card">
        <div className="card-head">
          <div>
            <h3>Invite links</h3>
            <p className="sub">Create a link for friends to join your group.</p>
          </div>
        </div>

        <div className="admin-grid">
          <label className="admin-field">
            <span>Group</span>
            <select value={selectedGroupId} onChange={(event) => setSelectedGroupId(event.target.value)}>
              <option value="">Select a group</option>
              {(groups ?? []).map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>
          <button className="secondary" disabled={!selectedGroupId} onClick={handleCreateInvite}>
            Create invite
          </button>
        </div>

        {inviteLink && (
          <div className="notice success">
            <p>Invite link created:</p>
            <code>{inviteLink}</code>
            {expiresAt && <p>Expires: {new Date(expiresAt).toLocaleString()}</p>}
          </div>
        )}
        {error && <p className="notice error">{error}</p>}
      </section>
    </AdminLayout>
  );
}
