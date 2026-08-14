'use client';

import { TOverlay } from '@/types/OverlayType';
import { TPlayer } from '@/types/PlayerType';
import { Strings } from '@/utils/stringUtils';
import { Fragment, useEffect, useRef, useState } from 'react';

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 24;

function PlayerCell({ player, reversed }: Readonly<{ player?: TPlayer; reversed?: boolean }>) {
  const nameRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(MAX_FONT_SIZE);

  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    let size = MAX_FONT_SIZE;
    el.style.fontSize = size + 'px';
    while (el.scrollWidth > el.clientWidth && size > MIN_FONT_SIZE) {
      size -= 1;
      el.style.fontSize = size + 'px';
    }
    setFontSize(size);
  }, [player?.playerName, player?.teamName]);

  if (!player) return <div />;

  return (
    <div
      className={`flex min-w-0 items-center gap-1 font-bold text-zinc-50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${reversed ? 'flex-row-reverse' : ''}`}
    >
      {player.championImage && (
        <img src={player.championImage} alt={player.championName} className="size-8 shrink-0" />
      )}
      <span
        ref={nameRef}
        style={{ fontSize }}
        className={`min-w-0 flex-1 text-nowrap ${reversed ? 'text-right' : 'text-left'}`}
      >
        {player.teamName && <span className="uppercase">{player.teamName}&nbsp;</span>}
        {player.playerName}
      </span>
    </div>
  );
}

export default function OverlayContent({
  blueTeam,
  redTeam,
}: Readonly<{
  blueTeam: TOverlay['blueTeam'];
  redTeam: TOverlay['redTeam'];
}>) {
  const isValid = (player: TPlayer) =>
    Strings.isNotBlank(player.championName) && Strings.isNotBlank(player.playerName);
  const blue = blueTeam.filter(isValid);
  const red = redTeam.filter(isValid);
  const rowCount = Math.max(blue.length, red.length);

  return (
    <div className="rounded-xs absolute bottom-0 right-[264px] grid w-[350px] grid-cols-2 items-center gap-x-2 gap-y-1 border-2 border-solid bg-[radial-gradient(ellipse_at_50%_40%,hsl(217_60%_44%/0.3)_0%,hsl(217_60%_24%/0.5)_55%,hsl(217_65%_16%/0.8)_100%)] p-1 shadow-[0_0_0_1px_rgba(20,15,4,0.55),0_10px_30px_rgba(0,0,0,0.18)] [border-image:linear-gradient(140deg,hsl(42,67%,29%)_0%,hsl(43,59%,59%)_50%,hsl(42,67%,29%)_100%)_1]">
      {Array.from({ length: rowCount }, (_, i) => (
        <Fragment key={i}>
          <PlayerCell player={blue[i]} />
          <PlayerCell player={red[i]} reversed />
        </Fragment>
      ))}
    </div>
  );
}
