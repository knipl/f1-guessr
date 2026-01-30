import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RacesService {
  constructor(private readonly prisma: PrismaService) {}

  async listRaces() {
    return this.prisma.race.findMany({
      orderBy: [{ season: 'desc' }, { round: 'desc' }]
    });
  }

  async getNextRace() {
    const now = new Date();
    const race = await this.prisma.race.findFirst({
      where: {
        raceStartTime: { gt: now }
      },
      orderBy: { raceStartTime: 'asc' }
    });

    if (!race) {
      throw new NotFoundException('No upcoming race found');
    }

    return race;
  }

  async getGroupResults(raceId: string, groupId: string) {
    return this.prisma.score.findMany({
      where: { raceId, groupId },
      include: { user: true },
      orderBy: { points: 'desc' }
    });
  }

  async getSeasonStandings(groupId: string) {
    const scores = await this.prisma.score.findMany({
      where: { groupId },
      include: { user: true }
    });

    const totals = new Map<string, { userId: string; name: string; points: number }>();

    for (const score of scores) {
      const key = score.userId;
      const existing = totals.get(key);
      const name = score.user.displayName ?? score.user.email ?? 'Player';
      if (existing) {
        existing.points += score.points;
      } else {
        totals.set(key, { userId: key, name, points: score.points });
      }
    }

    return [...totals.values()].sort((a, b) => b.points - a.points);
  }
}
