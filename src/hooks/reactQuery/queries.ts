import { fetchChampionsByVersion, fetchKcLeaderboard, fetchLatestLolVersion } from '@/api/LolApi';
import { TChampion } from '@/types/ChampionType';
import { TPlayerLeaderboard } from '@/types/PlayerLeaderboard';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const useFetchLatestLolVersion = (
  options?: Omit<UseQueryOptions<string, Error>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    ...options,
    queryKey: ['lol-latest-version'],
    queryFn: () => fetchLatestLolVersion(),
  });

export const useFetchChampionsByVersion = (
  lolVersion?: string,
  options?: Omit<UseQueryOptions<TChampion[], Error>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    staleTime: 7 * 24 * 60 * 60 * 1000, // 1 week
    gcTime: 14 * 24 * 60 * 60 * 1000, // 2 weeks
    enabled: !!lolVersion,
    ...options,
    queryKey: ['lol-champions-by-version', lolVersion],
    queryFn: () => fetchChampionsByVersion(lolVersion!),
  });

export const useFetchLatestChampions = (
  options?: Omit<UseQueryOptions<TChampion[], Error>, 'queryKey' | 'queryFn'>,
) => {
  const { data: latestVersion } = useFetchLatestLolVersion();

  return useFetchChampionsByVersion(latestVersion, {
    enabled: !!latestVersion,
    ...options,
  });
};

export const useFetchKcLeaderboard = (
  options?: Omit<UseQueryOptions<TPlayerLeaderboard[], Error>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    ...options,
    queryKey: ['kc-leaderboard'],
    queryFn: () => fetchKcLeaderboard(),
  });
