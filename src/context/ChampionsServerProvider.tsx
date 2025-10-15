import { ChampionsProvider } from '@/context/ChampionsContext';
import { getLatestChampions } from '@/lib/championApi';

export default async function ChampionsServerProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const champions = await getLatestChampions().catch(() => []);
  return <ChampionsProvider champions={champions}>{children}</ChampionsProvider>;
}
