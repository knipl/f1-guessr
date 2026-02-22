import { useEffect, useState } from 'react';
import { apiClient } from './client';

export interface Group {
  id: string;
  name: string;
}

export interface Race {
  id: string;
  name: string;
  circuit: string;
  q1StartTime: string;
  raceStartTime: string;
  status: string;
  season?: number;
  round?: number;
}

export interface TestingSession {
  name: string;
  date_start: string;
}

export interface Vote {
  id: string;
  ranking: string[];
}

export interface StandingRow {
  userId: string;
  name: string;
  points: number;
}

export interface GroupResultRow {
  user: { id: string; displayName?: string; email?: string };
  points: number;
}

export interface DriverInfo {
  name: string;
  number: number;
  team: string | null;
}

export interface RaceSession {
  id: string;
  raceId: string;
  type: 'practice' | 'qualifying' | 'race';
  startTime: string;
}

function useApiData<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loader()
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Error');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, deps);

  return { data, loading, error };
}

export function useGroups(refreshKey = 0) {
  return useApiData(() => apiClient.get<Group[]>('/groups'), [refreshKey]);
}

export function useDefaultGroup() {
  return useApiData(() => apiClient.get<Group | null>('/groups/me'), []);
}

export function useRaces() {
  return useApiData(() => apiClient.get<Race[]>('/races'), []);
}

export function useNextRace() {
  return useApiData(() => apiClient.get<Race | TestingSession | null>('/races/next'), []);
}

export function useStandings(groupId?: string) {
  return useApiData(
    () => apiClient.get<StandingRow[]>(`/races/standings?groupId=${groupId ?? ''}`),
    [groupId]
  );
}

export function useGroupResults(raceId?: string, groupId?: string) {
  return useApiData(
    () => apiClient.get<GroupResultRow[]>(`/races/${raceId}/results?groupId=${groupId ?? ''}`),
    [raceId, groupId]
  );
}

export function useMyVote(raceId?: string, groupId?: string, refreshKey = 0) {
  return useApiData(
    () => apiClient.get<Vote | null>(`/votes/me?raceId=${raceId ?? ''}&groupId=${groupId ?? ''}`),
    [raceId, groupId, refreshKey]
  );
}

export function useDrivers() {
  return useApiData(() => apiClient.get<DriverInfo[]>('/drivers'), []);
}

export function useRaceSessions(raceId?: string, refreshKey = 0) {
  return useApiData(
    () => {
      if (!raceId) return Promise.resolve([] as RaceSession[]);
      return apiClient.get<RaceSession[]>(`/admin/races/${raceId}/sessions`);
    },
    [raceId, refreshKey]
  );
}

export async function submitVote(payload: { raceId: string; groupId: string; ranking: string[] }) {
  return apiClient.post<Vote>('/votes', payload);
}

export async function submitRaceResults(raceId: string, positions: string[]) {
  return apiClient.post(`/admin/races/${raceId}/results`, { positions });
}

export async function submitRaceSession(
  raceId: string,
  payload: { type: 'practice' | 'qualifying' | 'race'; startTime: string }
) {
  return apiClient.post(`/admin/races/${raceId}/sessions`, payload);
}

export function useAdminRaces(refreshKey = 0) {
  return useApiData(() => apiClient.get<Race[]>('/admin/races'), [refreshKey]);
}

export async function createRace(payload: {
  season: number;
  round: number;
  name: string;
  circuit: string;
  q1StartTime: string;
  raceStartTime: string;
  status?: string;
}) {
  return apiClient.post<Race>('/admin/races', payload);
}

export async function updateRace(
  raceId: string,
  payload: Partial<{
    season: number;
    round: number;
    name: string;
    circuit: string;
    q1StartTime: string;
    raceStartTime: string;
    status?: string;
  }>
) {
  return apiClient.patch<Race>(`/admin/races/${raceId}`, payload);
}

export async function deleteRace(raceId: string) {
  return apiClient.delete(`/admin/races/${raceId}`);
}

export async function createGroupInvite(groupId: string) {
  return apiClient.post<{ token: string; expiresAt: string }>(`/admin/groups/${groupId}/invites`, {});
}

export async function joinGroupByInvite(token: string) {
  return apiClient.post<Group>(`/invites/${token}/join`, {});
}

export async function createAdminGroup(name: string) {
  return apiClient.post<Group>('/admin/groups', { name });
}
