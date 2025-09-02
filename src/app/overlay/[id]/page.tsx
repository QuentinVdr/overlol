import OverlayContent from '@/components/OverlayContent';
import { overlayService } from '@/db';

export default async function Overlay({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const overlay = await overlayService.getOverlay(id);

  if (!overlay) {
    return (
      <div className="h-full w-full text-center align-middle text-5xl leading-[100vh] font-bold text-red-500">
        Overlay not found, id should be wrong
      </div>
    );
  }

  const { blueTeam, redTeam } = overlay.data;

  return <OverlayContent blueTeam={blueTeam} redTeam={redTeam} />;
}
