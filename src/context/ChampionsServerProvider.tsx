import { ChampionsProvider } from '@/context/ChampionsContext';
import { getLatestChampions } from '@/lib/championApi';
import { ReactNode } from 'react';

export default async function ChampionsServerProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const champions = await getLatestChampions().catch(() => []);
  return <ChampionsProvider champions={champions}>{children}</ChampionsProvider>;
}
