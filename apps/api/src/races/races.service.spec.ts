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

describe('RacesService', () => {
  const service = new RacesService(prismaMock as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists races', async () => {
    prismaMock.race.findMany.mockResolvedValue([{ id: 'race-1' }]);

    const races = await service.listRaces();

    expect(races).toEqual([{ id: 'race-1' }]);
  });

  it('returns next race', async () => {
    prismaMock.race.findFirst.mockResolvedValue({ id: 'race-next' });

    const race = await service.getNextRace();

    expect(race).toEqual({ id: 'race-next' });
  });

  it('returns group results', async () => {
    prismaMock.score.findMany.mockResolvedValue([{ id: 'score-1' }]);

    const results = await service.getGroupResults('race-1', 'group-1');

    expect(results).toEqual([{ id: 'score-1' }]);
  });
});
