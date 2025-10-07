import { fetchChampionsByVersion, fetchKcLeaderboard, fetchLatestLolVersion } from '@/api/LolApi';
import { queryOptions, useQuery } from '@tanstack/react-query';

export const latestLolVersionOptions = () =>
  queryOptions({
    queryKey: ['lol-latest-version'] as const,
    queryFn: () => fetchLatestLolVersion(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });

export const championsByVersionOptions = (lolVersion: string) =>
  queryOptions({
    queryKey: ['lol-champions-by-version', lolVersion] as const,
    queryFn: () => fetchChampionsByVersion(lolVersion),
    staleTime: 7 * 24 * 60 * 60 * 1000, // 1 week
    gcTime: 14 * 24 * 60 * 60 * 1000, // 2 weeks
  });

export const kcLeaderboardOptions = () =>
  queryOptions({
    queryKey: ['kc-leaderboard'] as const,
    queryFn: () => fetchKcLeaderboard(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });

export const useFetchLatestLolVersion = () => {
  return useQuery(latestLolVersionOptions());
};

export const useFetchChampionsByVersion = (lolVersion?: string) => {
  return useQuery({
    ...championsByVersionOptions(lolVersion ?? ''),
    enabled: !!lolVersion,
  });
};

export const useFetchLatestChampions = () => {
  const { data: latestVersion } = useFetchLatestLolVersion();

  return useFetchChampionsByVersion(latestVersion);
};

export const useFetchKcLeaderboard = () => {
  return useQuery(kcLeaderboardOptions());
};
