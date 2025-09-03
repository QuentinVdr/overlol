import { fetchChampionsByVersion, fetchLatestRiotApiVersion } from '@/api/RiotApi';
import { TChampion } from '@/types/ChampionType';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const useFetchLatestRiotApiVersion = (
  options?: Omit<UseQueryOptions<string, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    ...options,
    queryKey: ['latestRiotApiVersion'],
    queryFn: () => fetchLatestRiotApiVersion(),
  });
};

export const useFetchChampionsByVersion = (
  apiVersion: string,
  options?: Omit<UseQueryOptions<TChampion[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    staleTime: 7 * 24 * 60 * 60 * 1000, // 1 week
    gcTime: 14 * 24 * 60 * 60 * 1000, // 2 weeks
    enabled: !!apiVersion,
    ...options,
    queryKey: ['champion-version', apiVersion],
    queryFn: () => fetchChampionsByVersion(apiVersion),
  });
};

export const useFetchLatestChampions = (
  options?: Omit<UseQueryOptions<TChampion[], Error>, 'queryKey' | 'queryFn'>,
) => {
  const { data: latestVersion } = useFetchLatestRiotApiVersion();

  return useFetchChampionsByVersion(latestVersion as string, {
    enabled: !!latestVersion,
    ...options,
  });
};
