import { VotesService } from './votes.service';

const prismaMock = {
  vote: {
    findFirst: jest.fn(),
    upsert: jest.fn()
  },
  race: {
    findUnique: jest.fn()
  }
};

describe('VotesService', () => {
  const service = new VotesService(prismaMock as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns current vote', async () => {
    prismaMock.vote.findFirst.mockResolvedValue({ id: 'vote-1' });

    const vote = await service.getVote('user-1', 'race-1', 'group-1');

    expect(vote).toEqual({ id: 'vote-1' });
  });

  it('rejects invalid ranking length', async () => {
    await expect(
      service.submitVote('user-1', 'race-1', 'group-1', ['A', 'B'])
    ).rejects.toThrow('Ranking must include exactly 10 drivers');
  });

  it('locks vote after Q1', async () => {
    prismaMock.race.findUnique.mockResolvedValue({ q1StartTime: new Date(0) });

    await expect(
      service.submitVote('user-1', 'race-1', 'group-1', Array(10).fill('A'))
    ).rejects.toThrow('Voting is locked');
  });

  it('upserts vote when open', async () => {
    prismaMock.race.findUnique.mockResolvedValue({ q1StartTime: new Date(Date.now() + 60_000) });
    prismaMock.vote.upsert.mockResolvedValue({ id: 'vote-1' });

    const vote = await service.submitVote('user-1', 'race-1', 'group-1', Array(10).fill('A'));

    expect(vote).toEqual({ id: 'vote-1' });
    expect(prismaMock.vote.upsert).toHaveBeenCalled();
  });
});
