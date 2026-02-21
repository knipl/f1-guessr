import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import AdminResultsEditor from './AdminResultsEditor';

vi.mock('../api/hooks', async () => {
  const actual = await vi.importActual('../api/hooks');
  return {
    ...(actual as object),
    useRaceSessions: () => ({
      data: [{ id: 's1', raceId: 'race-1', type: 'practice', startTime: '2026-03-07T10:00:00Z' }]
    })
  };
});

const races = [
  {
    id: 'race-1',
    name: 'Bahrain Grand Prix',
    circuit: 'Bahrain International Circuit',
    q1StartTime: '2026-03-07T13:00:00Z',
    raceStartTime: '2026-03-08T15:00:00Z',
    status: 'scheduled'
  }
];

const drivers = Array.from({ length: 10 }, (_, index) => ({
  name: `Driver ${index + 1}`,
  number: index + 1,
  team: null
}));

describe('AdminResultsEditor', () => {
  it('submits ordered positions for the selected race', async () => {
    const onSubmit = vi.fn();
    const onSaveSession = vi.fn();

    render(
      <AdminResultsEditor
        races={races as any}
        drivers={drivers as any}
        onSubmit={onSubmit}
        onSaveSession={onSaveSession}
      />
    );

    const button = screen.getByRole('button', { name: /finalize results/i });
    await act(async () => {
      fireEvent.click(button);
    });

    expect(onSubmit).toHaveBeenCalledWith('race-1', drivers.map((driver) => driver.name));
  });

  it('submits a session update', async () => {
    const onSubmit = vi.fn();
    const onSaveSession = vi.fn();

    render(
      <AdminResultsEditor
        races={races as any}
        drivers={drivers as any}
        onSubmit={onSubmit}
        onSaveSession={onSaveSession}
      />
    );

    const raceSelect = screen.getByLabelText('Race');
    const timeInput = screen.getByLabelText('Session time (local)');
    const saveButton = screen.getByRole('button', { name: /save session/i });

    await act(async () => {
      fireEvent.change(raceSelect, { target: { value: 'race-1' } });
    });
    await act(async () => {
      fireEvent.input(timeInput, { target: { value: '2026-03-07T10:00' } });
    });
    expect(saveButton).not.toBeDisabled();
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(onSaveSession).toHaveBeenCalledWith(
      'race-1',
      'practice',
      new Date('2026-03-07T10:00').toISOString()
    );
  });

  it('renders sessions in a list', () => {
    const onSubmit = vi.fn();
    const onSaveSession = vi.fn();

    render(
      <AdminResultsEditor
        races={races as any}
        drivers={drivers as any}
        onSubmit={onSubmit}
        onSaveSession={onSaveSession}
      />
    );

    expect(screen.getByText('Sessions')).toBeInTheDocument();
    expect(screen.getByText('practice')).toBeInTheDocument();
  });
});
