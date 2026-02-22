import { useEffect, useState } from 'react';
import AuthCard from '../auth/AuthCard';
import { useSupabaseSession } from '../auth/useSupabaseSession';
import { joinGroupByInvite } from '../api/hooks';

interface JoinPageProps {
  token: string;
}

export default function JoinPage({ token }: JoinPageProps) {
  const { session, loading } = useSupabaseSession();
  const [status, setStatus] = useState('Joining…');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !token) return;
    let active = true;

    joinGroupByInvite(token)
      .then(() => {
        if (!active) return;
        setStatus('You are in! Redirecting…');
        window.setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to join group.');
      });

    return () => {
      active = false;
    };
  }, [session, token]);

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
        <section className="card">
          <h2>Join group</h2>
          <p className="sub">Sign in to accept the invite.</p>
        </section>
        <AuthCard />
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card">
        <h2>Joining group</h2>
        <p className="sub">{status}</p>
        {error && <p className="notice error">{error}</p>}
      </section>
    </main>
  );
}
