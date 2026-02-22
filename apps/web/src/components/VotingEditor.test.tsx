import { render, screen, fireEvent } from '@testing-library/react';
import VotingEditor from './VotingEditor';

const drivers = [
  { name: 'A', team: 'Ferrari' },
  { name: 'B', team: 'Mercedes' },
  { name: 'C', team: 'McLaren' },
  { name: 'D', team: 'Red Bull' },
  { name: 'E', team: 'Williams' },
  { name: 'F', team: 'Alpine' },
  { name: 'G', team: 'Aston Martin' },
  { name: 'H', team: 'Haas' },
  { name: 'I', team: 'Sauber' },
  { name: 'J', team: 'RB' }
];

describe('VotingEditor', () => {
  it('renders positions and drivers', () => {
    render(<VotingEditor drivers={drivers} ranking={drivers.map((driver) => driver.name)} locked={false} onSave={() => {}} />);

    expect(screen.getAllByTestId('vote-position')).toHaveLength(10);
    expect(screen.getByText('Pick drivers')).toBeInTheDocument();
  });

  it('allows entering edit mode and adding a driver', () => {
    render(<VotingEditor drivers={drivers} ranking={[]} locked={false} onSave={() => {}} />);

    fireEvent.click(screen.getByText('Edit picks'));
    fireEvent.click(screen.getAllByText('B')[0]);

    const items = screen.getAllByTestId('vote-item');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('B');
  });

  it('disables edit when locked', () => {
    render(<VotingEditor drivers={drivers} ranking={drivers.map((driver) => driver.name)} locked={true} onSave={() => {}} />);

    expect(screen.getByText('Locked')).toBeDisabled();
  });
});
