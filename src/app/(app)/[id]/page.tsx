import OverlayInfo from '@/components/OverlayInfo';
import { UpdateOverlayForm } from '@/components/UpdateOverlayForm';
import { redirect } from 'next/navigation';
import { getFullUrl } from '@/utils/url';

export default async function UpdateOverlay({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  if (!id) {
    redirect('/');
  }

  const overlayUrl = await getFullUrl(`/overlay/${id}`);

  return (
    <main className="flex h-full w-full flex-col gap-4 px-3 py-2 md:px-8">
      <h1>Update Overlay</h1>
      <OverlayInfo id={id} overlayUrl={overlayUrl} />
      <UpdateOverlayForm id={id} />
    </main>
  );
}
