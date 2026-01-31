import App from './App';
import { render, screen, within } from '@testing-library/react';

vi.mock('./auth/useSupabaseSession', () => ({
  useSupabaseSession: () => ({ session: null, loading: false })
}));

vi.mock('./api/hooks', () => ({
  useGroups: () => ({ data: [{ id: 'g1', name: 'Friends League' }], loading: false }),
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
  useDrivers: () => ({ data: [{ name: 'A', number: 1, team: null }], loading: false }),
  useStandings: () => ({ data: [{ userId: 'u1', name: 'Alex', points: 100 }], loading: false }),
  useMyVote: () => ({ data: { id: 'v1', ranking: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] } }),
  useGroupResults: () => ({
    data: [{ user: { id: 'u1', displayName: 'Alex' }, points: 40 }],
    loading: false
  }),
  submitVote: vi.fn()
}));

vi.mock('./mockData', () => ({
  mockDrivers: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  mockAchievements: [{ title: 'Champion’s Pick', detail: 'Guessed P1 correctly' }],
  mockRaceHistory: [{ race: 'Bahrain GP', score: 10, position: 1 }],
  mockStandings: [],
  mockVotesTable: []
}));

describe('App', () => {
  it('shows next race and group name', () => {
    render(<App />);

    expect(screen.getByText('Friends League')).toBeInTheDocument();
    expect(screen.getByText('Next race')).toBeInTheDocument();
    expect(screen.getByText('Bahrain Grand Prix')).toBeInTheDocument();
  });

  it('shows vote section and picks', () => {
    render(<App />);

    expect(screen.getByText('Your vote')).toBeInTheDocument();
    const picks = screen.getAllByTestId('vote-position');
    expect(picks).toHaveLength(10);
  });

  it('shows group results table', () => {
    render(<App />);

    const groupResults = screen.getByTestId('group-results');
    expect(within(groupResults).getByText('Group results (after race)')).toBeInTheDocument();
    expect(within(groupResults).getByText('Alex')).toBeInTheDocument();
  });
});
