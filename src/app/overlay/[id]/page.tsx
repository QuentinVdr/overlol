import { overlayService } from '@/db';
import { TOverlay } from '@/types/OverlayType';
import { Strings } from '@/utils/stringUtils';

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

  const { blueTeam, redTeam } = overlay.data as TOverlay;

  return (
    <>
      <div className="absolute bottom-0 left-[288px] my-1 flex max-h-[219px] w-[334px] flex-col bg-zinc-900/40 backdrop-blur-sm">
        {blueTeam
          .filter(
            (player) =>
              Strings.isNotBlank(player.championName) && Strings.isNotBlank(player.playerName),
          )
          .map((player) => (
            <div
              key={player.playerName}
              className="flex flex-nowrap items-center px-2 text-4xl font-semibold text-nowrap text-zinc-50"
            >
              {player.teamName && <span className="uppercase">{player.teamName}&nbsp;</span>}
              {player.playerName}, {player.championName}
            </div>
          ))}
      </div>
      <div className="absolute right-[276px] bottom-0 my-1 flex max-h-[219px] w-[334px] flex-col bg-zinc-900/40 backdrop-blur-sm">
        {redTeam
          .filter(
            (player) =>
              Strings.isNotBlank(player.championName) && Strings.isNotBlank(player.playerName),
          )
          .map((player) => (
            <div
              key={player.playerName}
              className="flex flex-nowrap items-center px-2 text-4xl font-semibold text-nowrap text-zinc-50"
            >
              {player.teamName && <span className="uppercase">{player.teamName}&nbsp;</span>}
              {player.playerName}, {player.championName}
            </div>
          ))}
      </div>
    </>
  );
}
