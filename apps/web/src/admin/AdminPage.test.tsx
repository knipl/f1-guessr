import { render, screen } from '@testing-library/react';
import AdminPage from './AdminPage';

vi.mock('../auth/useSupabaseSession', () => ({
  useSupabaseSession: () => ({ session: { user: { email: 'admin@example.com' } }, loading: false })
}));

vi.mock('./AdminRaceManager', () => ({
  default: () => <div>Race Manager</div>
}));

describe('AdminPage', () => {
  it('shows back button when signed in', () => {
    render(<AdminPage />);

    expect(screen.getByText('Back to app')).toBeInTheDocument();
  });
});
