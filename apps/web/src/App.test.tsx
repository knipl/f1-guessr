import App from './App';
import { render, screen, within } from '@testing-library/react';
import { useSupabaseSession } from './auth/useSupabaseSession';

vi.mock('./auth/useSupabaseSession', () => ({
  useSupabaseSession: vi.fn()
}));

const mockedUseSupabaseSession = vi.mocked(useSupabaseSession);

describe('App', () => {
  beforeEach(() => {
    mockedUseSupabaseSession.mockReturnValue({ session: null, loading: false });
  });

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

  it('shows standings and history sections', () => {
    render(<App />);

    expect(screen.getByText('Season standings')).toBeInTheDocument();
    expect(screen.getByText('Race history')).toBeInTheDocument();
    expect(screen.getByText('Achievements')).toBeInTheDocument();
  });

  it('shows group results table', () => {
    render(<App />);

    const groupResults = screen.getByTestId('group-results');
    expect(within(groupResults).getByText('Group results (after race)')).toBeInTheDocument();
    expect(within(groupResults).getByText('Alex')).toBeInTheDocument();
    expect(within(groupResults).getByText('Maya')).toBeInTheDocument();
    expect(within(groupResults).getByText('Jonas')).toBeInTheDocument();
  });
});
