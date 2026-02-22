import { render, screen } from '@testing-library/react';
import JoinPage from './JoinPage';

vi.mock('../auth/useSupabaseSession', () => ({
  useSupabaseSession: () => ({ session: null, loading: false })
}));

vi.mock('../api/hooks', () => ({
  joinGroupByInvite: vi.fn()
}));

describe('JoinPage', () => {
  it('asks user to sign in when signed out', () => {
    render(<JoinPage token="token-123" />);

    expect(screen.getByText('Join group')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });
});
