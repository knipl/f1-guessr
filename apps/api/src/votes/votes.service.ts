import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VotesService {
  constructor(private readonly prisma: PrismaService) {}

  async getVote(userId: string, raceId: string, groupId: string) {
    return this.prisma.vote.findFirst({
      where: { userId, raceId, groupId }
    });
  }

  async submitVote(userId: string, raceId: string, groupId: string, ranking: string[]) {
    if (ranking.length !== 10) {
      throw new BadRequestException('Ranking must include exactly 10 drivers');
    }

    const race = await this.prisma.race.findUnique({
      where: { id: raceId }
    });

    if (!race) {
      throw new NotFoundException('Race not found');
    }

    if (new Date() >= race.q1StartTime) {
      throw new ForbiddenException('Voting is locked');
    }

    return this.prisma.vote.upsert({
      where: {
        userId_raceId_groupId: { userId, raceId, groupId }
      },
      create: {
        userId,
        raceId,
        groupId,
        ranking
      },
      update: {
        ranking
      }
    });
  }
}
