import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthCard from './AuthCard';
import { useSupabaseSession } from './useSupabaseSession';

const supabaseAuthMock = vi.hoisted(() => ({
  signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
  signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn()
}));

vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: supabaseAuthMock
  }
}));

vi.mock('./useSupabaseSession', () => ({
  useSupabaseSession: vi.fn()
}));

const mockedUseSupabaseSession = vi.mocked(useSupabaseSession);

describe.skip('AuthCard', () => {
  beforeEach(() => {
    mockedUseSupabaseSession.mockReturnValue({ session: null, loading: false });
  });

  it('renders sign-in options when signed out', () => {
    render(<AuthCard />);

    expect(screen.getByText('Send magic link')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  it('shows message after requesting magic link', async () => {
    render(<AuthCard />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'fan@example.com' }
    });
    fireEvent.click(screen.getByText('Send magic link'));

    await waitFor(() => expect(supabaseAuthMock.signInWithOtp).toHaveBeenCalled());
    expect(screen.getByText('Check your email for a sign-in link.')).toBeInTheDocument();
  });

  it('triggers google sign in', async () => {
    render(<AuthCard />);

    fireEvent.click(screen.getByText('Continue with Google'));
    await waitFor(() => expect(supabaseAuthMock.signInWithOAuth).toHaveBeenCalled());
  });

  it('signs out when clicking sign out', async () => {
    mockedUseSupabaseSession.mockReturnValue({
      session: { user: { email: 'race@example.com' } } as any,
      loading: false
    });

    render(<AuthCard />);

    fireEvent.click(screen.getByText('Sign out'));
    await waitFor(() => expect(supabaseAuthMock.signOut).toHaveBeenCalled());
  });
});
