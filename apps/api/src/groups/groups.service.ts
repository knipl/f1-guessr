import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async listGroupsForUser(userId: string) {
    const memberships = await this.prisma.groupMember.findMany({
      where: { userId },
      include: { group: true }
    });

    return memberships.map((membership: { group: { id: string; name: string } }) => membership.group);
  }

  async joinByInvite(userId: string, token: string) {
    const invite = await this.prisma.groupInvite.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date()
        }
      },
      include: { group: true }
    });

    if (!invite) {
      throw new NotFoundException('Invite not found or expired');
    }

    await this.prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId }
    });

    await this.prisma.groupMember.upsert({
      where: {
        groupId_userId: {
          groupId: invite.groupId,
          userId
        }
      },
      create: {
        groupId: invite.groupId,
        userId
      },
      update: {}
    });

    return invite.group;
  }

  async getDefaultGroup(userId: string) {
    const membership = await this.prisma.groupMember.findFirst({
      where: { userId },
      include: { group: true },
      orderBy: { joinedAt: 'asc' }
    });

    return membership?.group ?? null;
  }
}
