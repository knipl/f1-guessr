import { AdminService } from './admin.service';

const prismaMock = {
  race: {
    findUnique: jest.fn(),
    update: jest.fn()
  },
  result: {
    upsert: jest.fn()
  },
  vote: {
    findMany: jest.fn()
  },
  score: {
    upsert: jest.fn()
  }
};

describe('AdminService', () => {
  const service = new AdminService(prismaMock as any);

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_EMAILS = 'admin@example.com';
  });

  it('rejects non-admin users', async () => {
    await expect(service.setRaceResults('race-1', [], 'nope@example.com')).rejects.toThrow(
      'Admin access required'
    );
  });

  it('writes results and scores', async () => {
    prismaMock.race.findUnique.mockResolvedValue({ id: 'race-1' });
    prismaMock.result.upsert.mockResolvedValue({ id: 'result-1' });
    prismaMock.vote.findMany.mockResolvedValue([
      { userId: 'user-1', raceId: 'race-1', groupId: 'group-1', ranking: ['A'] }
    ]);

    const result = await service.setRaceResults('race-1', ['A'], 'admin@example.com');

    expect(result).toEqual({ id: 'result-1' });
    expect(prismaMock.score.upsert).toHaveBeenCalled();
  });
});
