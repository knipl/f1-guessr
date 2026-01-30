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

export function useGroups() {
  return useApiData(() => apiClient.get<Group[]>('/groups'), []);
}

export function useNextRace() {
  return useApiData(() => apiClient.get<Race>('/races/next'), []);
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

export function useMyVote(raceId?: string, groupId?: string) {
  return useApiData(
    () => apiClient.get<Vote | null>(`/votes/me?raceId=${raceId ?? ''}&groupId=${groupId ?? ''}`),
    [raceId, groupId]
  );
}

export async function submitVote(payload: { raceId: string; groupId: string; ranking: string[] }) {
  return apiClient.post<Vote>('/votes', payload);
}
