'use client';

import { getLatestChampions } from '@/lib/championApi';
import type { TChampion } from '@/types/ChampionType';
import { createContext, useContext, useMemo } from 'react';

type ChampionsContextValue = {
  champions: TChampion[];
};

const ChampionsContext = createContext<ChampionsContextValue | undefined>(undefined);

export function ChampionsProvider({
  champions,
  children,
}: Readonly<{ champions: TChampion[]; children: React.ReactNode }>) {
  const value = useMemo<ChampionsContextValue>(() => ({ champions }), [champions]);
  return <ChampionsContext.Provider value={value}>{children}</ChampionsContext.Provider>;
}

export function useChampions(): TChampion[] {
  const ctx = useContext(ChampionsContext);
  if (!ctx) {
    throw new Error('useChampions must be used within a ChampionsProvider');
  }
  return ctx.champions;
}

export default async function ChampionsServerProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const champions = await getLatestChampions().catch(() => []);
  return <ChampionsProvider champions={champions}>{children}</ChampionsProvider>;
}
