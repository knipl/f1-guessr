import { AdminService } from './admin.service';

const prismaMock = {
  race: {
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn()
  },
  session: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn()
  },
  result: {
    upsert: jest.fn(),
    deleteMany: jest.fn()
  },
  vote: {
    findMany: jest.fn(),
    deleteMany: jest.fn()
  },
  score: {
    upsert: jest.fn(),
    deleteMany: jest.fn()
  },
  achievement: {
    deleteMany: jest.fn()
  },
  group: {
    findUnique: jest.fn(),
    create: jest.fn()
  },
  groupInvite: {
    create: jest.fn()
  },
  user: {
    upsert: jest.fn()
  },
  $transaction: jest.fn()
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

  it('lists races for admin', async () => {
    prismaMock.race.findMany.mockResolvedValue([{ id: 'race-1' }]);

    const races = await service.listRaces('admin@example.com');

    expect(races).toEqual([{ id: 'race-1' }]);
  });

  it('creates a race', async () => {
    prismaMock.race.create.mockResolvedValue({ id: 'race-1' });

    const race = await service.createRace(
      {
        season: 2026,
        round: 1,
        name: 'Bahrain Grand Prix',
        circuit: 'Bahrain',
        q1StartTime: '2026-03-07T12:00:00Z',
        raceStartTime: '2026-03-08T15:00:00Z'
      },
      'admin@example.com'
    );

    expect(race).toEqual({ id: 'race-1' });
  });

  it('updates a race', async () => {
    prismaMock.race.findUnique.mockResolvedValue({ id: 'race-1' });
    prismaMock.race.update.mockResolvedValue({ id: 'race-1', name: 'Updated' });

    const updated = await service.updateRace(
      'race-1',
      { name: 'Updated' },
      'admin@example.com'
    );

    expect(updated).toEqual({ id: 'race-1', name: 'Updated' });
  });

  it('deletes a race with related data', async () => {
    prismaMock.race.findUnique.mockResolvedValue({ id: 'race-1' });
    prismaMock.$transaction.mockResolvedValue([]);

    const result = await service.deleteRace('race-1', 'admin@example.com');

    expect(result).toEqual({ id: 'race-1' });
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it('creates a group invite', async () => {
    prismaMock.group.findUnique.mockResolvedValue({ id: 'group-1' });
    prismaMock.groupInvite.create.mockResolvedValue({ id: 'invite-1' });

    const invite = await service.createGroupInvite('group-1', 'admin@example.com');

    expect(invite).toEqual({ id: 'invite-1' });
    expect(prismaMock.groupInvite.create).toHaveBeenCalled();
  });

  it('creates a group', async () => {
    prismaMock.group.create.mockResolvedValue({ id: 'group-1', name: 'Friends' });
    prismaMock.user.upsert.mockResolvedValue({ id: 'user-1' });

    const group = await service.createGroup('Friends', 'user-1', 'admin@example.com', 'admin@example.com');

    expect(group).toEqual({ id: 'group-1', name: 'Friends' });
    expect(prismaMock.group.create).toHaveBeenCalled();
    expect(prismaMock.user.upsert).toHaveBeenCalled();
  });

  it('creates a session and updates race timing', async () => {
    prismaMock.race.findUnique.mockResolvedValue({ id: 'race-1' });
    prismaMock.session.findFirst.mockResolvedValue(null);
    prismaMock.session.create.mockResolvedValue({ id: 'session-1' });

    const result = await service.setRaceSession(
      'race-1',
      'qualifying' as any,
      '2026-03-07T12:00:00Z',
      'admin@example.com'
    );

    expect(result).toEqual({ id: 'session-1' });
    expect(prismaMock.race.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { q1StartTime: expect.any(Date) } })
    );
  });

  it('lists race sessions in ascending order', async () => {
    prismaMock.race.findUnique.mockResolvedValue({ id: 'race-1' });
    prismaMock.session.findMany.mockResolvedValue([{ id: 'session-1' }]);

    const result = await service.listRaceSessions('race-1', 'admin@example.com');

    expect(result).toEqual([{ id: 'session-1' }]);
    expect(prismaMock.session.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { startTime: 'asc' } })
    );
  });
});
