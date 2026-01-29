export type RaceStatus = 'scheduled' | 'locked' | 'finalized';

export interface RaceSummary {
  id: string;
  season: number;
  round: number;
  name: string;
  circuit: string;
  q1StartTime: string;
  raceStartTime: string;
  status: RaceStatus;
}

export interface Vote {
  userId: string;
  raceId: string;
  ranking: string[];
  updatedAt: string;
}

export interface RaceResult {
  raceId: string;
  positions: string[];
  updatedAt: string;
}
