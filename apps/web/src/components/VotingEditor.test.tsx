import { render, screen, fireEvent } from '@testing-library/react';
import VotingEditor from './VotingEditor';

const drivers = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

describe('VotingEditor', () => {
  it('renders positions and drivers', () => {
    render(<VotingEditor drivers={drivers} ranking={drivers} locked={false} onSave={() => {}} />);

    expect(screen.getAllByTestId('vote-position')).toHaveLength(10);
    expect(screen.getByText('Pick drivers')).toBeInTheDocument();
  });

  it('allows entering edit mode and adding a driver', () => {
    render(<VotingEditor drivers={drivers} ranking={['A']} locked={false} onSave={() => {}} />);

    fireEvent.click(screen.getByText('Edit picks'));
    fireEvent.click(screen.getAllByText('B')[1]);

    const items = screen.getAllByTestId('vote-item');
    expect(items).toHaveLength(10);
    expect(items[1]).toHaveTextContent('B');
  });

  it('disables edit when locked', () => {
    render(<VotingEditor drivers={drivers} ranking={drivers} locked={true} onSave={() => {}} />);

    expect(screen.getByText('Locked')).toBeDisabled();
  });
});
