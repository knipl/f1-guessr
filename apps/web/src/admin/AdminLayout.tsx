import AuthCard from '../auth/AuthCard';
import { useSupabaseSession } from '../auth/useSupabaseSession';

interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
}

const menuItems = [
  { label: 'Races', path: '/admin/races' },
  { label: 'Groups', path: '/admin/groups' },
  { label: 'Invites', path: '/admin/invites' }
];

export default function AdminLayout({ title, children }: AdminLayoutProps) {
  const { session, loading } = useSupabaseSession();
  const currentPath = window.location.pathname;

  if (loading) {
    return (
      <main className="page admin-page">
        <section className="card">
          <p className="sub">Checking session…</p>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="page admin-page">
        <AuthCard />
      </main>
    );
  }

  return (
    <main className="page admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <p className="tag">F1 Guessr Admin</p>
          <h1>Admin</h1>
        </div>
        <nav className="admin-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`nav-link ${currentPath === item.path ? 'active' : ''}`}
              onClick={() => {
                window.location.href = item.path;
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button className="secondary" onClick={() => (window.location.href = '/')}>
          Back to app
        </button>
      </aside>
      <section className="admin-content">
        <header className="hero">
          <div>
            <h2>{title}</h2>
            <p className="sub">Manage settings for this season.</p>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
