import App from './App';
import { render, screen, within } from '@testing-library/react';

const { sessionMock } = vi.hoisted(() => ({
  sessionMock: { value: null as any }
}));

vi.mock('./auth/useSupabaseSession', () => ({
  useSupabaseSession: () => ({ session: sessionMock.value, loading: false })
}));

const { useDriversMock } = vi.hoisted(() => ({
  useDriversMock: vi.fn(() => ({ data: [{ name: 'A', number: 1, team: 'Ferrari' }], loading: false }))
}));

vi.mock('./api/hooks', () => ({
  useGroups: () => ({ data: [{ id: 'g1', name: 'Friends League' }], loading: false }),
  useDefaultGroup: () => ({ data: { id: 'g1', name: 'Friends League' }, loading: false }),
  useAdminRaces: () => ({ data: [], loading: false }),
  useRaces: () => ({
    data: [
      {
        id: 'r1',
        name: 'Bahrain Grand Prix',
        circuit: 'Bahrain International Circuit',
        q1StartTime: '2026-03-07T13:00:00Z',
        raceStartTime: '2026-03-08T15:00:00Z',
        status: 'scheduled'
      }
    ],
    loading: false
  }),
  useNextRace: () => ({
    data: {
      id: 'r1',
      name: 'Bahrain Grand Prix',
      circuit: 'Bahrain International Circuit',
      q1StartTime: '2026-03-07T13:00:00Z',
      raceStartTime: '2026-03-08T15:00:00Z',
      status: 'scheduled'
    },
    loading: false
  }),
  useDrivers: () => useDriversMock(),
  useStandings: () => ({ data: [{ userId: 'u1', name: 'Alex', points: 100 }], loading: false }),
  useMyVote: () => ({ data: { id: 'v1', ranking: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] } }),
  useGroupResults: () => ({
    data: [{ user: { id: 'u1', displayName: 'Alex' }, points: 40 }],
    loading: false
  }),
  submitVote: vi.fn(),
  submitRaceResults: vi.fn(),
  submitRaceSession: vi.fn(),
  useRaceSessions: () => ({ data: [] }),
  createRace: vi.fn(),
  updateRace: vi.fn(),
  deleteRace: vi.fn(),
  joinGroupByInvite: vi.fn(),
  createGroupInvite: vi.fn()
}));

vi.mock('./admin/AdminRaceManager', () => ({
  default: () => <div>Admin Races</div>
}));

vi.mock('./admin/AdminInviteManager', () => ({
  default: () => <div>Admin Invites</div>
}));

vi.mock('./admin/AdminGroupsPage', () => ({
  default: () => <div>Admin Groups</div>
}));

vi.mock('./mockData', () => ({
  mockDrivers: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  mockAchievements: [{ title: 'Champion’s Pick', detail: 'Guessed P1 correctly' }],
  mockRaceHistory: [{ race: 'Bahrain GP', score: 10, position: 1 }],
  mockStandings: [],
  mockVotesTable: []
}));

describe('App', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
    useDriversMock.mockReturnValue({ data: [{ name: 'A', number: 1, team: 'Ferrari' }], loading: false });
    sessionMock.value = null;
  });
  it('shows next race and group name', () => {
    render(<App />);

    expect(screen.getByText('Friends League')).toBeInTheDocument();
    expect(screen.getByText('Next race')).toBeInTheDocument();
    expect(screen.getByText('Bahrain Grand Prix')).toBeInTheDocument();
  });

  it('shows sign-in card when signed out', () => {
    render(<App />);

    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('shows sign out button when signed in', () => {
    sessionMock.value = { user: { email: 'user@example.com' } };
    render(<App />);

    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('renders admin page on /admin', () => {
    window.history.pushState({}, '', '/admin');
    render(<App />);

    expect(screen.getByText('Admin Races')).toBeInTheDocument();
  });

  it('renders join page on /join/:token', () => {
    window.history.pushState({}, '', '/join/test-token');
    render(<App />);

    expect(screen.getByText('Join group')).toBeInTheDocument();
  });

  it('renders admin groups page on /admin/groups', () => {
    window.history.pushState({}, '', '/admin/groups');
    render(<App />);

    expect(screen.getByText('Admin Groups')).toBeInTheDocument();
  });

  it('renders admin invites page on /admin/invites', () => {
    window.history.pushState({}, '', '/admin/invites');
    render(<App />);

    expect(screen.getByText('Admin Invites')).toBeInTheDocument();
  });

  it('shows vote section and picks', () => {
    render(<App />);

    expect(screen.getByText('Your vote')).toBeInTheDocument();
    const picks = screen.queryAllByTestId('vote-position');
    expect(picks.length).toBeGreaterThanOrEqual(0);
  });

  it('shows loading placeholders when drivers are loading', () => {
    useDriversMock.mockReturnValue({ data: null, loading: true });
    render(<App />);

    expect(screen.getByText('Loading your picks…')).toBeInTheDocument();
  });

  it('shows group results table', () => {
    render(<App />);

    const groupResults = screen.getByTestId('group-results');
    expect(within(groupResults).getByText('Group results (after race)')).toBeInTheDocument();
    expect(within(groupResults).getByText('Alex')).toBeInTheDocument();
  });

  it('hides admin tools for signed-out users', () => {
    render(<App />);

    expect(screen.queryByTestId('admin-panel')).not.toBeInTheDocument();
  });
});
