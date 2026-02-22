import { render, screen } from '@testing-library/react';
import AdminLayout from './AdminLayout';

vi.mock('../auth/useSupabaseSession', () => ({
  useSupabaseSession: () => ({ session: { user: { email: 'admin@example.com' } }, loading: false })
}));

describe('AdminLayout', () => {
  it('shows back button when signed in', () => {
    render(
      <AdminLayout title="Test">
        <div>Content</div>
      </AdminLayout>
    );

    expect(screen.getByText('Back to app')).toBeInTheDocument();
  });
});
