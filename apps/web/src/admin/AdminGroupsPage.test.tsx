import { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AdminGroupsPage from './AdminGroupsPage';

const { createGroupMock } = vi.hoisted(() => ({
  createGroupMock: vi.fn()
}));

vi.mock('../auth/useSupabaseSession', () => ({
  useSupabaseSession: () => ({ session: { user: { email: 'admin@example.com' } }, loading: false })
}));

vi.mock('../api/hooks', async () => {
  const actual = await vi.importActual('../api/hooks');
  return {
    ...(actual as object),
    useGroups: () => ({ data: [], loading: false }),
    createAdminGroup: createGroupMock
  };
});

describe('AdminGroupsPage', () => {
  it('creates a group', async () => {
    render(<AdminGroupsPage />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Group name'), { target: { value: 'Friends' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create group' }));
    });

    expect(createGroupMock).toHaveBeenCalledWith('Friends');
  });
});
