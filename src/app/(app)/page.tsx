import { CreateOverlayForm } from '@/components/OverlayForm/CreateOverlayForm';
import OverlayInfo from '@/components/OverlayInfo';
import { getLatestChampions } from '@/lib/serverApi';
import { TChampion } from '@/types/ChampionType';
import { getFullUrl } from '@/utils/url';

export default async function Home() {
  let champions: TChampion[];

  try {
    champions = await getLatestChampions();
  } catch (error) {
    console.error('Failed to fetch champions data:', error);
    champions = [];
  }

  return (
    <main className="flex h-full w-full flex-col gap-4 px-3 py-2 md:px-8">
      <h1>Lol spec overlay generator</h1>
      <OverlayInfo
        title={`Leaderboard overlay`}
        overlayUrl={await getFullUrl(`/overlay/leaderboard`)}
      />
      <CreateOverlayForm champions={champions} />
    </main>
  );
}
