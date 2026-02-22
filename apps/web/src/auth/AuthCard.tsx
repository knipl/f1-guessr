import { FormEvent, useState } from 'react';
import { supabase } from './supabaseClient';
import { useSupabaseSession } from './useSupabaseSession';

export default function AuthCard() {
  const { session, loading } = useSupabaseSession();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  const handleEmailSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Enter an email address.');
      return;
    }

    setWorking(true);
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: false
      }
    });
    setWorking(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setMessage('Check your email for a sign-in link.');
  };


  const handleSignOut = async () => {
    setWorking(true);
    await supabase.auth.signOut();
    setWorking(false);
  };

  return (
    <section className="card">
      <div className="card-head">
        <h2>Sign in</h2>
        {session?.user?.email && <span className="pill">{session.user.email}</span>}
      </div>

      {loading ? (
        <p className="sub">Checking session…</p>
      ) : session ? (
        <div className="auth-actions">
          <p className="sub">You are signed in.</p>
          <button className="secondary" onClick={handleSignOut} disabled={working}>
            Sign out
          </button>
        </div>
      ) : (
        <div className="auth-grid">
          <form onSubmit={handleEmailSignIn} className="auth-form">
            <label>
              Email
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <button className="primary" type="submit" disabled={working}>
              Send magic link
            </button>
          </form>
        </div>
      )}

      {message && <p className="notice success">{message}</p>}
      {error && <p className="notice error">{error}</p>}
    </section>
  );
}
