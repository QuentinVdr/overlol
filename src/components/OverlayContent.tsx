'use client';

import { TOverlay } from '@/types/OverlayType';
import { Strings } from '@/utils/stringUtils';
import { useEffect, useMemo, useRef } from 'react';

const MAX_WIDTH = 334;
const MAX_HEIGHT = 219;
const MIN_FONT_SIZE = 12;

export default function OverlayContent({
  blueTeam,
  redTeam,
}: Readonly<{
  blueTeam: TOverlay['blueTeam'];
  redTeam: TOverlay['redTeam'];
}>) {
  const blueRef = useRef<HTMLDivElement>(null);
  const redRef = useRef<HTMLDivElement>(null);

  // Memoize team data to prevent unnecessary recalculations when arrays have same content
  const blueTeamKey = useMemo(() => JSON.stringify(blueTeam), [blueTeam]);
  const redTeamKey = useMemo(() => JSON.stringify(redTeam), [redTeam]);

  // Helper to fit font size for both width and height
  useEffect(() => {
    if (blueRef.current) {
      let fontSize = 40;
      blueRef.current.style.fontSize = fontSize + 'px';
      let width = blueRef.current.scrollWidth;
      let height = blueRef.current.scrollHeight;
      while ((width > MAX_WIDTH || height > MAX_HEIGHT) && fontSize > MIN_FONT_SIZE) {
        fontSize -= 1;
        blueRef.current.style.fontSize = fontSize + 'px';
        width = blueRef.current.scrollWidth;
        height = blueRef.current.scrollHeight;
      }
    }
  }, [blueTeamKey]);

  useEffect(() => {
    if (redRef.current) {
      let fontSize = 40;
      redRef.current.style.fontSize = fontSize + 'px';
      let width = redRef.current.scrollWidth;
      let height = redRef.current.scrollHeight;
      while ((width > MAX_WIDTH || height > MAX_HEIGHT) && fontSize > MIN_FONT_SIZE) {
        fontSize -= 1;
        redRef.current.style.fontSize = fontSize + 'px';
        width = redRef.current.scrollWidth;
        height = redRef.current.scrollHeight;
      }
    }
  }, [redTeamKey]);

  return (
    <>
      <div className="absolute bottom-0 left-[288px] flex max-h-[219px] w-[334px] flex-col bg-zinc-900/40 backdrop-blur-sm">
        <div ref={blueRef}>
          {blueTeam
            .filter(
              (player) =>
                Strings.isNotBlank(player.championName) && Strings.isNotBlank(player.playerName),
            )
            .map((player) => (
              <div
                key={player.playerName}
                className="flex flex-nowrap items-center px-2 font-semibold text-nowrap text-zinc-50"
              >
                {player.teamName && <span className="uppercase">{player.teamName}&nbsp;</span>}
                {player.playerName}, {player.championName}
              </div>
            ))}
        </div>
      </div>
      <div className="absolute right-[276px] bottom-0 flex max-h-[219px] w-[334px] flex-col bg-zinc-900/40 backdrop-blur-sm">
        <div ref={redRef}>
          {redTeam
            .filter(
              (player) =>
                Strings.isNotBlank(player.championName) && Strings.isNotBlank(player.playerName),
            )
            .map((player) => (
              <div
                key={player.playerName}
                className="flex flex-nowrap items-center px-2 font-semibold text-nowrap text-zinc-50"
              >
                {player.teamName && <span className="uppercase">{player.teamName}&nbsp;</span>}
                {player.playerName}, {player.championName}
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
