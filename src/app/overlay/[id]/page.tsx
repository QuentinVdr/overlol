import OverlayContent from '@/components/OverlayContent';
import { kcPlayerNameAndTeamList } from '@/lib/KcPlayerList';
import { OverlayService } from '@/lib/overlayService';
import { Great_Vibes } from 'next/font/google';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import fs from 'node:fs';
import path from 'node:path';

const greatVibes = Great_Vibes({ weight: '400', subsets: ['latin'] });

export default async function Overlay({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  if (!id) {
    redirect('/');
  }
  const overlay = OverlayService.getOverlay(id);

  if (!overlay) {
    return (
      <div className="h-full w-full text-center align-middle text-5xl font-bold leading-[100vh] text-red-500">
        Overlay not found, id should be wrong
      </div>
    );
  }

  const { blueTeam, redTeam, kcPlayerSpec } = overlay.data;
  const isKnownKcPlayer =
    !!kcPlayerSpec &&
    kcPlayerNameAndTeamList.some(
      (kc) => kc.name === kcPlayerSpec.name && kc.team === kcPlayerSpec.team,
    );
  const hasSpecPortrait =
    isKnownKcPlayer &&
    fs.existsSync(path.join(process.cwd(), 'public', 'players', `${kcPlayerSpec.name}.png`));

  return (
    <>
      <OverlayContent blueTeam={blueTeam} redTeam={redTeam} />
      {hasSpecPortrait && (
        <div className="absolute bottom-0 left-[288px] h-[282px] w-[334px] overflow-hidden bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,hsl(217_60%_24%/0.9)_0%,hsl(217_60%_24%/0.6)_35%,hsl(217_65%_16%/0)_70%)]">
          <Image
            src={`/players/${kcPlayerSpec.name}.png`}
            alt={kcPlayerSpec.name}
            width="334"
            height="282"
            className="absolute inset-0 -z-10"
          />
          <div
            className={`${greatVibes.className} absolute inset-x-0 bottom-1 text-center text-5xl text-zinc-50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]`}
          >
            {kcPlayerSpec.team} {kcPlayerSpec.name}
          </div>
        </div>
      )}
    </>
  );
}
