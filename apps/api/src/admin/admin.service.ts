import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { RaceStatus, SessionType } from '@prisma/client';
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

  async listRaces(adminEmail?: string) {
    this.assertAdmin(adminEmail);
    return this.prisma.race.findMany({
      orderBy: [{ season: 'desc' }, { round: 'desc' }]
    });
  }

  async createRace(
    payload: {
      season: number;
      round: number;
      name: string;
      circuit: string;
      q1StartTime: string;
      raceStartTime: string;
      status?: RaceStatus;
    },
    adminEmail?: string
  ) {
    this.assertAdmin(adminEmail);
    const q1StartTime = new Date(payload.q1StartTime);
    const raceStartTime = new Date(payload.raceStartTime);

    if (Number.isNaN(q1StartTime.getTime()) || Number.isNaN(raceStartTime.getTime())) {
      throw new BadRequestException('Invalid race time');
    }

    return this.prisma.race.create({
      data: {
        season: payload.season,
        round: payload.round,
        name: payload.name,
        circuit: payload.circuit,
        q1StartTime,
        raceStartTime,
        status: payload.status ?? 'scheduled'
      }
    });
  }

  async updateRace(
    raceId: string,
    payload: Partial<{
      season: number;
      round: number;
      name: string;
      circuit: string;
      q1StartTime: string;
      raceStartTime: string;
      status: RaceStatus;
    }>,
    adminEmail?: string
  ) {
    this.assertAdmin(adminEmail);
    const existing = await this.prisma.race.findUnique({ where: { id: raceId } });
    if (!existing) {
      throw new NotFoundException('Race not found');
    }

    const data: Record<string, unknown> = { ...payload };

    if (payload.q1StartTime) {
      const parsed = new Date(payload.q1StartTime);
      if (Number.isNaN(parsed.getTime())) {
        throw new BadRequestException('Invalid Q1 time');
      }
      data.q1StartTime = parsed;
    }

    if (payload.raceStartTime) {
      const parsed = new Date(payload.raceStartTime);
      if (Number.isNaN(parsed.getTime())) {
        throw new BadRequestException('Invalid race time');
      }
      data.raceStartTime = parsed;
    }

    return this.prisma.race.update({
      where: { id: raceId },
      data
    });
  }

  async deleteRace(raceId: string, adminEmail?: string) {
    this.assertAdmin(adminEmail);
    const existing = await this.prisma.race.findUnique({ where: { id: raceId } });
    if (!existing) {
      throw new NotFoundException('Race not found');
    }

    await this.prisma.$transaction([
      this.prisma.session.deleteMany({ where: { raceId } }),
      this.prisma.vote.deleteMany({ where: { raceId } }),
      this.prisma.score.deleteMany({ where: { raceId } }),
      this.prisma.result.deleteMany({ where: { raceId } }),
      this.prisma.achievement.deleteMany({ where: { raceId } }),
      this.prisma.race.delete({ where: { id: raceId } })
    ]);

    return { id: raceId };
  }

  async setRaceSession(
    raceId: string,
    type: SessionType,
    startTime: string,
    adminEmail?: string
  ) {
    this.assertAdmin(adminEmail);

    const race = await this.prisma.race.findUnique({ where: { id: raceId } });
    if (!race) {
      throw new NotFoundException('Race not found');
    }

    const parsed = new Date(startTime);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('Invalid start time');
    }

    const existing = await this.prisma.session.findFirst({
      where: { raceId, type }
    });

    const session = existing
      ? await this.prisma.session.update({
          where: { id: existing.id },
          data: { startTime: parsed }
        })
      : await this.prisma.session.create({
          data: { raceId, type, startTime: parsed }
        });

    if (type === 'qualifying') {
      await this.prisma.race.update({
        where: { id: raceId },
        data: { q1StartTime: parsed }
      });
    }

    if (type === 'race') {
      await this.prisma.race.update({
        where: { id: raceId },
        data: { raceStartTime: parsed }
      });
    }

    return session;
  }

  async listRaceSessions(raceId: string, adminEmail?: string) {
    this.assertAdmin(adminEmail);

    const race = await this.prisma.race.findUnique({ where: { id: raceId } });
    if (!race) {
      throw new NotFoundException('Race not found');
    }

    return this.prisma.session.findMany({
      where: { raceId },
      orderBy: { startTime: 'asc' }
    });
  }
}
