'use client';

import { TOverlay } from '@/types/OverlayType';
import { Strings } from '@/utils/stringUtils';
import { useEffect, useRef, useState } from 'react';

export default function OverlayContent({
  blueTeam,
  redTeam,
}: Readonly<{
  blueTeam: TOverlay['blueTeam'];
  redTeam: TOverlay['redTeam'];
}>) {
  const blueRef = useRef<HTMLDivElement>(null);
  const redRef = useRef<HTMLDivElement>(null);
  const [blueFontSize, setBlueFontSize] = useState(40); // px
  const [redFontSize, setRedFontSize] = useState(40); // px
  const maxWidth = 334;
  const maxHeight = 219;
  const minFontSize = 12;

  // Helper to fit font size for both width and height
  useEffect(() => {
    if (blueRef.current) {
      let fontSize = 40;
      blueRef.current.style.fontSize = fontSize + 'px';
      let width = blueRef.current.scrollWidth;
      let height = blueRef.current.scrollHeight;
      while ((width > maxWidth || height > maxHeight) && fontSize > minFontSize) {
        fontSize -= 1;
        blueRef.current.style.fontSize = fontSize + 'px';
        width = blueRef.current.scrollWidth;
        height = blueRef.current.scrollHeight;
      }
      setBlueFontSize(fontSize);
    }
  }, [blueTeam]);

  useEffect(() => {
    if (redRef.current) {
      let fontSize = 40;
      redRef.current.style.fontSize = fontSize + 'px';
      let width = redRef.current.scrollWidth;
      let height = redRef.current.scrollHeight;
      while ((width > maxWidth || height > maxHeight) && fontSize > minFontSize) {
        fontSize -= 1;
        redRef.current.style.fontSize = fontSize + 'px';
        width = redRef.current.scrollWidth;
        height = redRef.current.scrollHeight;
      }
      setRedFontSize(fontSize);
    }
  }, [redTeam]);

  return (
    <>
      <div className="absolute bottom-0 left-[288px] flex max-h-[219px] w-[334px] flex-col bg-zinc-900/40 backdrop-blur-sm">
        <div ref={blueRef} style={{ fontSize: blueFontSize }}>
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
        <div ref={redRef} style={{ fontSize: redFontSize }}>
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
