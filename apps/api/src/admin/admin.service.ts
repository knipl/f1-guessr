import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { computeScore } from '../scores/score.util';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private assertAdmin(email?: string) {
    const list = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (!email || !list.includes(email)) {
      throw new ForbiddenException('Admin access required');
    }
  }

  async setRaceResults(raceId: string, positions: string[], adminEmail?: string) {
    this.assertAdmin(adminEmail);

    const race = await this.prisma.race.findUnique({ where: { id: raceId } });
    if (!race) {
      throw new NotFoundException('Race not found');
    }

    const result = await this.prisma.result.upsert({
      where: { raceId },
      create: { raceId, positions },
      update: { positions }
    });

    await this.prisma.race.update({
      where: { id: raceId },
      data: { status: 'finalized' }
    });

    const votes = await this.prisma.vote.findMany({ where: { raceId } });
    await Promise.all(
      votes.map((vote: { userId: string; raceId: string; groupId: string; ranking: unknown }) =>
        this.prisma.score.upsert({
          where: {
            userId_raceId_groupId: {
              userId: vote.userId,
              raceId: vote.raceId,
              groupId: vote.groupId
            }
          },
          create: {
            userId: vote.userId,
            raceId: vote.raceId,
            groupId: vote.groupId,
            points: computeScore(vote.ranking as string[], positions),
            rankChange: 0
          },
          update: {
            points: computeScore(vote.ranking as string[], positions)
          }
        })
      )
    );

    return result;
  }
}
