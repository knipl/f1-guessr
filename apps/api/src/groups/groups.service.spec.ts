import { GroupsService } from './groups.service';

const prismaMock = {
  groupMember: {
    findMany: jest.fn(),
    upsert: jest.fn()
  },
  groupInvite: {
    findFirst: jest.fn()
  }
};

describe('GroupsService', () => {
  const service = new GroupsService(prismaMock as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists groups for user', async () => {
    prismaMock.groupMember.findMany.mockResolvedValue([
      { group: { id: 'g1', name: 'Friends' } },
      { group: { id: 'g2', name: 'Work' } }
    ]);

    const groups = await service.listGroupsForUser('user-1');

    expect(groups).toEqual([
      { id: 'g1', name: 'Friends' },
      { id: 'g2', name: 'Work' }
    ]);
    expect(prismaMock.groupMember.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      include: { group: true }
    });
  });

  it('joins group via valid invite', async () => {
    prismaMock.groupInvite.findFirst.mockResolvedValue({
      groupId: 'g1',
      group: { id: 'g1', name: 'Friends' }
    });

    const group = await service.joinByInvite('user-1', 'token');

    expect(group).toEqual({ id: 'g1', name: 'Friends' });
    expect(prismaMock.groupMember.upsert).toHaveBeenCalled();
  });

  it('throws if invite is missing or expired', async () => {
    prismaMock.groupInvite.findFirst.mockResolvedValue(null);

    await expect(service.joinByInvite('user-1', 'bad-token')).rejects.toThrow(
      'Invite not found or expired'
    );
  });
});
