import { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AdminInviteManager from './AdminInviteManager';

vi.mock('../auth/useSupabaseSession', () => ({
  useSupabaseSession: () => ({ session: { user: { email: 'admin@example.com' } }, loading: false })
}));

const { inviteMock } = vi.hoisted(() => ({
  inviteMock: vi.fn()
}));

vi.mock('../api/hooks', async () => {
  const actual = await vi.importActual('../api/hooks');
  return {
    ...(actual as object),
    useGroups: () => ({ data: [{ id: 'g1', name: 'Friends' }], loading: false }),
    createGroupInvite: inviteMock
  };
});

// AdminLayout renders normally, auth is mocked above.

describe('AdminInviteManager', () => {
  it('creates invite for selected group', async () => {
    inviteMock.mockResolvedValue({ token: 'abc', expiresAt: new Date().toISOString() });
    render(<AdminInviteManager />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Group'), { target: { value: 'g1' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create invite' }));
    });

    expect(inviteMock).toHaveBeenCalledWith('g1');
    expect(screen.getByText('Invite link created:')).toBeInTheDocument();
  });
});
