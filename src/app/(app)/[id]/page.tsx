import { UpdateOverlayForm } from '@/components/OverlayForm/UpdateOverlayForm';
import OverlayInfo from '@/components/OverlayInfo';
import { getLatestChampions } from '@/lib/championApi';
import { OverlayService } from '@/lib/overlayService';
import { TChampion } from '@/types/ChampionType';
import { getFullUrl } from '@/utils/url';
import { redirect } from 'next/navigation';

export default async function UpdateOverlay({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  if (!id) {
    redirect('/');
  }

  const overlay = OverlayService.getOverlay(id);

  if (!overlay) {
    redirect('/');
  }

  const champions = await getLatestChampions().catch((error) => {
    console.error('Failed to fetch champions data:', error);
    return [] as TChampion[];
  });

  return (
    <main className="flex h-full w-full flex-col gap-4 px-3 py-2 md:px-8">
      <h1>Update Overlay</h1>
      <OverlayInfo
        title={`Overlay in game ${id}`}
        overlayUrl={await getFullUrl(`/overlay/${id}`)}
      />
      <UpdateOverlayForm id={id} overlay={overlay.data} champions={champions} />
    </main>
  );
}
