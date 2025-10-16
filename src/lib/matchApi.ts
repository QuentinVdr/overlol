'use server';

import { TParticipant } from '@/types/MatchParticipantType';
import { Strings } from '@/utils/stringUtils';
import { getLatestChampions } from './championApi';

/**
 * Server-side function to fetch the puuid of a player by their game name and tag line.
 * @returns {Promise<string>} A promise of the player's PUUID.
 */
async function getPlayerPUUIDByGameNameAndTagLine(
  gameName: string,
  tagLine: string,
): Promise<string> {
  const riotApiKey = process.env.NEXT_RIOT_API_KEY;

  if (Strings.isBlank(riotApiKey)) {
    throw new Error('Riot API key is not set in environment variables');
  }

  const response = await fetch(
    `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
    {
      headers: {
        accept: 'application/json',
        'X-Riot-Token': riotApiKey!,
      },
      signal: AbortSignal.timeout(5000),
      next: {
        revalidate: 1800, // 30 minutes cache
        tags: ['PUUID', `PUUID-${gameName}-${tagLine}`],
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch player PUUID: ${response.status}`);
  }

  const data = await response.json();

  if (typeof data.puuid !== 'string') {
    throw new Error('Unexpected response shape when fetching player PUUID');
  }

  return data.puuid;
}

/**
 * Server-side function to fetch the current match data of a player by their PUUID.
 * @param {string} puuid - The player's PUUID.
 * @returns {Promise<TParticipant[]>} A promise of the current match participants.
 */
async function getCurrentMatchByPUUID(puuid: string): Promise<TParticipant[]> {
  const riotApiKey = process.env.NEXT_RIOT_API_KEY;

  if (Strings.isBlank(riotApiKey)) {
    throw new Error('Riot API key is not set in environment variables');
  }

  const response = await fetch(
    `https://euw1.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`,
    {
      headers: {
        accept: 'application/json',
        'X-Riot-Token': riotApiKey!,
      },
      signal: AbortSignal.timeout(5000),
      next: {
        revalidate: 1800, // 30 minutes cache
        tags: ['CurrentMatch', `CurrentMatch-${puuid}`],
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch current match data: ${response.status}`);
  }

  const data = await response.json();
  const champions = await getLatestChampions();

  return data.participants.map((participant: TParticipant) => ({
    puuid: participant.puuid,
    teamId: participant.teamId,
    riotId: participant.riotId,
    championId: participant.championId,
    championName:
      champions.find((champion) => champion.key === String(participant.championId))?.name ||
      'Unknown Champion',
  })) as TParticipant[];
}

/**
 * Gets the current match participants for a player identified by their game name and tag line.
 * @param {string} gameName - The player's game name.
 * @param {string} tagLine - The player's tag line.
 * @returns {Promise<TParticipant[]>} A promise of the current match participants.
 */
export async function getCurrentMatchByGameNameAndTagLine(
  gameName: string,
  tagLine: string,
): Promise<TParticipant[]> {
  const puuid = await getPlayerPUUIDByGameNameAndTagLine(gameName, tagLine);
  return getCurrentMatchByPUUID(puuid);
}
