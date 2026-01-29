import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('shows next race and group name', () => {
    render(<App />);

    expect(screen.getByText('Friends League')).toBeInTheDocument();
    expect(screen.getByText('Next race')).toBeInTheDocument();
    expect(screen.getByText('Bahrain Grand Prix')).toBeInTheDocument();
  });

  it('renders ten picks', () => {
    render(<App />);

    const picks = screen.getAllByText(/P\d+/);
    expect(picks).toHaveLength(10);
  });

  it('renders group results table rows', () => {
    render(<App />);

    expect(screen.getByText('Group results (after race)')).toBeInTheDocument();
    expect(screen.getByText('Alex')).toBeInTheDocument();
    expect(screen.getByText('Maya')).toBeInTheDocument();
    expect(screen.getByText('Jonas')).toBeInTheDocument();
  });
});
