import { RacesService } from './races.service';

const prismaMock = {
  race: {
    findMany: jest.fn(),
    findFirst: jest.fn()
  },
  score: {
    findMany: jest.fn()
  }
};

const openF1Mock = {
  syncSeason: jest.fn(),
  fetchTestingSessions: jest.fn()
};

describe('RacesService', () => {
  const service = new RacesService(prismaMock as any, openF1Mock as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists races', async () => {
    prismaMock.race.findMany.mockResolvedValue([{ id: 'race-1' }]);

    const races = await service.listRaces();

    expect(races).toEqual([{ id: 'race-1' }]);
  });

  it('returns next race when no upcoming testing', async () => {
    prismaMock.race.findFirst.mockResolvedValue({
      id: 'race-next',
      name: 'Bahrain Grand Prix',
      circuit: 'Bahrain International Circuit',
      season: 2026
    });
    openF1Mock.fetchTestingSessions.mockResolvedValue([]);

    const race = await service.getNextRace();

    expect(openF1Mock.syncSeason).toHaveBeenCalled();
    expect(race).toEqual({
      id: 'race-next',
      name: 'Bahrain Grand Prix',
      circuit: 'Bahrain International Circuit',
      season: 2026
    });
  });

  it('returns null when no upcoming race', async () => {
    prismaMock.race.findFirst.mockResolvedValue(null);

    const result = await service.getNextRace();

    expect(result).toBeNull();
  });

  it('returns testing session when upcoming', async () => {
    prismaMock.race.findFirst.mockResolvedValue({
      id: 'race-next',
      name: 'Bahrain',
      circuit: 'Bahrain',
      season: 2026,
      raceStartTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
    openF1Mock.fetchTestingSessions.mockResolvedValue([
      { name: 'Day 1', date_start: new Date(Date.now() + 1000).toISOString() }
    ]);

    const result = await service.getNextRace();

    expect(result).toEqual({ name: 'Day 1', date_start: expect.any(String) });
  });


  it('returns group results', async () => {
    prismaMock.score.findMany.mockResolvedValue([{ id: 'score-1' }]);

    const results = await service.getGroupResults('race-1', 'group-1');

    expect(results).toEqual([{ id: 'score-1' }]);
  });
});
