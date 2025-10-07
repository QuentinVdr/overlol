import { TLeaderboardApiResponse, TLeaderboardPlayer } from '@/types/LeaderboardApiTypes';
import { TPlayerLeaderboard } from '@/types/PlayerLeaderboard';
import { fetchRegionRank } from '@/utils/leaderboardUtils';
import { logger } from '@/utils/logger';
import { NextResponse } from 'next/server';

const log = logger.child('api:leaderboard');

export const revalidate = 1800; // 30 minutes

export function GET() {
  log.info('Fetching leaderboard from API');

  return fetch('https://dpm.lol/v1/leaderboards/custom/29e4e979-4c43-4ac7-bf5f-5f5195551f66', {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(5000),
    // Next.js Data Cache
    next: {
      revalidate,
      tags: ['lol-leaderboard'],
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<TLeaderboardApiResponse>;
    })
    .then(async (payload) => {
      if (!payload?.players || !Array.isArray(payload.players)) {
        throw new Error('Unexpected KC leaderboard response shape');
      }

      const uniquePlayersMap = payload.players.reduce(
        (acc: Map<string, TPlayerLeaderboard>, player: TLeaderboardPlayer) => {
          const displayName = player.displayName;
          if (!acc.has(displayName)) {
            acc.set(displayName, {
              team: player.team,
              player: displayName,
              inGameName: player.gameName,
              tagLine: player.tagLine,
              rank: player.rank.rank,
              tier: player.rank.tier,
              lp: player.rank.leaguePoints,
            });
          }
          return acc;
        },
        new Map<string, TPlayerLeaderboard>(),
      );

      const encryptedPUUID =
        'WJhTXSEJFMgTMYiYdPxqt3m2F7v-Rqnba18343CKED1276nK7tsdAXQuGz-cNW1XqNkHfo9Ym-Bndw';
      await fetch(
        `https://euw1.api.riotgames.com/lol/league/v4/entries/by-puuid/${encryptedPUUID}`,
        {
          headers: {
            accept: 'application/json',
            'X-Riot-Token': process.env.NEXT_RIOT_API_KEY || '',
          },
          signal: AbortSignal.timeout(5000),
          // Next.js Data Cache
          next: {
            revalidate,
            tags: ['lol-leaderboard'],
          },
        },
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        })
        .then((data) => {
          const hazelPlayer = uniquePlayersMap.get('Hazel');
          if (hazelPlayer && data[0]?.leaguePoints && hazelPlayer.lp < data[0].leaguePoints) {
            log.info(`Overriding Hazel's LP from ${hazelPlayer.lp} to ${data[0].leaguePoints}`);
            hazelPlayer.lp = data[0].leaguePoints;
            hazelPlayer.tier = data[0].tier;
            hazelPlayer.inGameName = 'Antarctica';
            hazelPlayer.tagLine = 'S B';
          }
        })
        .catch((error) => {
          log.error('Failed to fetch Override of Hazel', error);
        });

      const leaderboard = Array.from(uniquePlayersMap.values());
      log.info(`Created leaderboard with ${leaderboard.length} unique players`);

      log.info('Fetching region ranks...');
      const startTime = Date.now();

      return fetchRegionRank(leaderboard)
        .then((updatedLeaderboard) => {
          const duration = Date.now() - startTime;
          log.info(`Region ranks fetched successfully in ${duration}ms`);

          return NextResponse.json(updatedLeaderboard, {
            headers: {
              // Browser cache: 5 minutes (shorter for fresh data)
              'Cache-Control': 'public, max-age=300, stale-while-revalidate=59',
            },
          });
        })
        .catch((error) => {
          log.warn('Failed to fetch region ranks, returning base leaderboard', error);

          return NextResponse.json(leaderboard, {
            headers: {
              // Browser cache: 3 minutes for partial data
              'Cache-Control': 'public, max-age=180, stale-while-revalidate=59',
            },
          });
        });
    })
    .catch((error) => {
      log.error('Failed to get leaderboard', error);
      return NextResponse.json(
        { error: 'Failed to fetch LoL leaderboard' },
        {
          status: 500,
          headers: {
            'Cache-Control': 'no-store',
          },
        },
      );
    });
}
