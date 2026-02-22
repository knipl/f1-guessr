import { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AdminRaceManager from './AdminRaceManager';

const { createRaceMock, updateRaceMock, deleteRaceMock, racesState } = vi.hoisted(() => ({
  createRaceMock: vi.fn(),
  updateRaceMock: vi.fn(),
  deleteRaceMock: vi.fn(),
  racesState: { value: [] as any[] }
}));

vi.mock('../api/hooks', async () => {
  const actual = await vi.importActual('../api/hooks');
  return {
    ...(actual as object),
    useAdminRaces: () => ({ data: racesState.value, loading: false }),
    createRace: createRaceMock,
    updateRace: updateRaceMock,
    deleteRace: deleteRaceMock,
    submitRaceSession: vi.fn()
  };
});

vi.mock('../auth/useSupabaseSession', () => ({
  useSupabaseSession: () => ({ session: { user: { email: 'admin@example.com' } }, loading: false })
}));

describe('AdminRaceManager', () => {
  it('creates a race from the form', async () => {
    racesState.value = [];
    render(<AdminRaceManager />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Season'), { target: { value: '2026' } });
      fireEvent.change(screen.getByLabelText('Round'), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText('Race name'), { target: { value: 'Bahrain Grand Prix' } });
      fireEvent.change(screen.getByLabelText('Circuit'), { target: { value: 'Bahrain' } });
      fireEvent.change(screen.getByLabelText('Q1 start (local)'), { target: { value: '2026-03-07T12:00' } });
      fireEvent.change(screen.getByLabelText('Race start (local)'), { target: { value: '2026-03-08T15:00' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create race' }));
    });

    expect(createRaceMock).toHaveBeenCalled();
  });

  it('clears form when selecting new race', async () => {
    racesState.value = [
      {
        id: 'race-1',
        name: 'Yas Marina GP',
        circuit: 'Yas Marina',
        q1StartTime: '2026-12-06T12:00:00Z',
        raceStartTime: '2026-12-07T12:00:00Z',
        status: 'scheduled',
        season: 2026,
        round: 24
      }
    ];

    render(<AdminRaceManager />);

    const select = screen.getByLabelText('Existing races');
    await act(async () => {
      fireEvent.change(select, { target: { value: '' } });
    });

    expect((screen.getByLabelText('Race name') as HTMLInputElement).value).toBe('');
  });

  it('shows a races table', () => {
    racesState.value = [
      {
        id: 'race-1',
        name: 'Yas Marina GP',
        circuit: 'Yas Marina',
        q1StartTime: '2026-12-06T12:00:00Z',
        raceStartTime: '2026-12-07T12:00:00Z',
        status: 'scheduled',
        season: 2026,
        round: 24
      },
      {
        id: 'race-0',
        name: 'Bahrain GP',
        circuit: 'Bahrain',
        q1StartTime: '2026-03-07T12:00:00Z',
        raceStartTime: '2026-03-08T12:00:00Z',
        status: 'scheduled',
        season: 2026,
        round: 1
      }
    ];

    render(<AdminRaceManager />);

    expect(screen.getByText('All races')).toBeInTheDocument();
    expect(screen.getByText('Yas Marina GP')).toBeInTheDocument();
    const rows = screen.getAllByText(/GP/);
    expect(rows[0]).toHaveTextContent('Bahrain GP');
  });
});
