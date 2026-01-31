import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface OpenF1Session {
  session_key: number;
  meeting_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  location?: string;
  country_name?: string;
  circuit_short_name?: string;
  year: number;
}

interface OpenF1Driver {
  driver_number: number;
  full_name: string;
  last_name: string;
  team_name?: string;
  session_key: number;
}

interface MeetingBundle {
  meetingKey: number;
  race: OpenF1Session;
  qualifying?: OpenF1Session;
}

const ONE_HOUR = 60 * 60 * 1000;

@Injectable()
export class OpenF1Service {
  private lastSyncAt = 0;
  private driversCache: { timestamp: number; drivers: OpenF1Driver[] } | null = null;
  private testingCache: { timestamp: number; sessions: OpenF1Session[] } | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async syncSeason(year: number) {
    const now = Date.now();
    if (now - this.lastSyncAt < ONE_HOUR) {
      return;
    }

    const sessions = await this.fetchSessions(year);
    const meetings = mapMeetings(sessions);
    const sortedMeetings = [...meetings].sort(
      (a, b) => new Date(a.race.date_start).getTime() - new Date(b.race.date_start).getTime()
    );

    for (let index = 0; index < sortedMeetings.length; index += 1) {
      const meeting = sortedMeetings[index];
      const round = index + 1;
      await this.upsertRace(year, round, meeting);
    }

    this.lastSyncAt = now;
  }

  private async fetchSessions(year: number): Promise<OpenF1Session[]> {
    const response = await fetch(`https://api.openf1.org/v1/sessions?year=${year}`);
    if (!response.ok) {
      return [];
    }

    return response.json();
  }

  async fetchDrivers() {
    if (this.driversCache && Date.now() - this.driversCache.timestamp < ONE_HOUR) {
      return mapDrivers(this.driversCache.drivers);
    }

    const response = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
    if (!response.ok) {
      return [];
    }

    const drivers = (await response.json()) as OpenF1Driver[];
    this.driversCache = { timestamp: Date.now(), drivers };

    return mapDrivers(drivers);
  }

  async fetchTestingSessions(year: number) {
    if (this.testingCache && Date.now() - this.testingCache.timestamp < ONE_HOUR) {
      return mapTestingSessions(this.testingCache.sessions);
    }

    const sessions = await this.fetchSessions(year);
    const filtered = sessions.filter((session) => {
      const name = session.session_name?.toLowerCase() ?? '';
      const meetingKey = session.meeting_key;
      return (meetingKey === 1304 || meetingKey === 1305) && name.startsWith('day');
    });

    this.testingCache = { timestamp: Date.now(), sessions: filtered };

    return mapTestingSessions(filtered);
  }

  private async upsertRace(year: number, round: number, meeting: MeetingBundle) {
    const existing = await this.prisma.race.findUnique({
      where: { season_round: { season: year, round } }
    });

    if (existing?.status === 'finalized') {
      return;
    }

    const raceSession = meeting.race;
    const qualifyingSession = meeting.qualifying;
    const nameBase = raceSession.location ?? raceSession.country_name ?? 'Grand Prix';
    const name = nameBase.includes('Grand Prix') ? nameBase : `${nameBase} Grand Prix`;
    const circuit = raceSession.circuit_short_name ?? raceSession.location ?? raceSession.country_name ?? name;

    const data = {
      season: year,
      round,
      name,
      circuit,
      q1StartTime: qualifyingSession ? new Date(qualifyingSession.date_start) : new Date(raceSession.date_start),
      raceStartTime: new Date(raceSession.date_start),
      status: existing?.status ?? 'scheduled'
    };

    if (existing) {
      await this.prisma.race.update({
        where: { id: existing.id },
        data
      });
      return;
    }

    await this.prisma.race.create({ data });
  }
}

export function mapMeetings(sessions: OpenF1Session[]): MeetingBundle[] {
  const grouped = new Map<number, { race?: OpenF1Session; qualifying?: OpenF1Session }>();

  for (const session of sessions) {
    if (session.session_name !== 'Race' && session.session_name !== 'Qualifying') continue;

    const entry = grouped.get(session.meeting_key) ?? {};
    if (session.session_name === 'Race') {
      entry.race = session;
    }
    if (session.session_name === 'Qualifying') {
      entry.qualifying = session;
    }
    grouped.set(session.meeting_key, entry);
  }

  const meetings = [...grouped.entries()]
    .filter(([, value]) => Boolean(value.race))
    .map(([meetingKey, value]) => ({
      meetingKey,
      race: value.race as OpenF1Session,
      qualifying: value.qualifying
    }));

  return meetings;
}

export function mapDrivers(drivers: OpenF1Driver[]) {
  return [...drivers]
    .sort((a, b) => a.driver_number - b.driver_number)
    .map((driver) => ({
      name: driver.last_name || driver.full_name,
      number: driver.driver_number,
      team: driver.team_name ?? null
    }));
}

export function mapTestingSessions(sessions: OpenF1Session[]) {
  return sessions
    .filter((session) => {
      const name = session.session_name?.toLowerCase() ?? '';
      const meetingKey = session.meeting_key;
      return (meetingKey === 1304 || meetingKey === 1305) && name.startsWith('day');
    })
    .map((session) => ({
      name: session.session_name,
      date_start: session.date_start
    }));
}
