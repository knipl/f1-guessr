import AuthCard from '../auth/AuthCard';
import { useSupabaseSession } from '../auth/useSupabaseSession';
import AdminRaceManager from './AdminRaceManager';

export default function AdminPage() {
  const { session, loading } = useSupabaseSession();

  if (loading) {
    return (
      <main className="page">
        <section className="card">
          <p className="sub">Checking session…</p>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="page">
        <AuthCard />
      </main>
    );
  }

  const handleBack = () => {
    window.location.href = '/';
  };

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="tag">F1 Guessr Admin</p>
          <h1>Admin panel</h1>
          <p className="sub">Manage races and sessions.</p>
        </div>
        <div className="hero-actions">
          <button className="secondary" onClick={handleBack}>
            Back to app
          </button>
        </div>
      </header>
      <AdminRaceManager />
    </main>
  );
}
