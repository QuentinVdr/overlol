import { fetchChampionByVersion, fetchLatestRiotApiVersion } from '@/api/RiotApi';
import { TChampion } from '@/types/ChampionType';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const useFetchLatestRiotApiVersion = (
  options?: Omit<UseQueryOptions<string, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
    queryKey: ['latestRiotApiVersion'],
    queryFn: () => fetchLatestRiotApiVersion(),
  });
};

export const useFetchChampionByVersion = (
  apiVersion: string,
  options?: Omit<UseQueryOptions<TChampion[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    enabled: !!apiVersion,
    ...options,
    queryKey: ['champion-version', apiVersion],
    queryFn: () => fetchChampionByVersion(apiVersion),
  });
};
