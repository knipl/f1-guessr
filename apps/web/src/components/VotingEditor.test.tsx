import { render, screen, fireEvent } from '@testing-library/react';
import VotingEditor from './VotingEditor';

const drivers = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

describe('VotingEditor', () => {
  it('renders positions and drivers', () => {
    render(<VotingEditor drivers={drivers} ranking={drivers} locked={false} onSave={() => {}} />);

    expect(screen.getAllByTestId('vote-position')).toHaveLength(10);
    expect(screen.getByText('Your vote')).toBeInTheDocument();
  });

  it('allows entering edit mode', () => {
    render(<VotingEditor drivers={drivers} ranking={drivers} locked={false} onSave={() => {}} />);

    fireEvent.click(screen.getByText('Edit picks'));
    expect(screen.getByText('Save picks')).toBeInTheDocument();
  });

  it('disables edit when locked', () => {
    render(<VotingEditor drivers={drivers} ranking={drivers} locked={true} onSave={() => {}} />);

    expect(screen.getByText('Locked')).toBeDisabled();
  });
});
