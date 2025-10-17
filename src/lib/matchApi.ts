'use server';

import { TParticipant } from '@/types/MatchParticipantType';
import { logger } from '@/utils/logger';
import { Strings } from '@/utils/stringUtils';
import { getLatestChampions } from './championApi';

/**
 * Custom error class for match API errors with HTTP status codes
 */
export class MatchApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'MatchApiError';
  }
}

/**
 * Server-side function to fetch the puuid of a player by their game name and tag line.
 * @returns {Promise<string>} A promise of the player's PUUID.
 */
async function getPlayerPUUIDByGameNameAndTagLine(
  gameName: string,
  tagLine: string,
): Promise<string> {
  const riotApiKey = process.env.NEXT_RIOT_API_KEY;
  const log = logger.child('match-service:fetch-puuid-player');

  if (Strings.isBlank(riotApiKey)) {
    log.error('Riot API key is not set in environment variables');
    throw new MatchApiError('Server configuration error', 500);
  }

  try {
    const response = await fetch(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
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
      log.error(`Failed to fetch player PUUID: ${response.status}, ${response.statusText}`, {
        gameName,
        tagLine,
      });

      // Map Riot API status codes to appropriate errors
      switch (response.status) {
        case 404:
          throw new MatchApiError(`Player ${gameName}#${tagLine} not found`, 404, {
            gameName,
            tagLine,
          });
        case 429:
          throw new MatchApiError('Rate limit exceeded. Please try again later', 429);
        case 403:
          throw new MatchApiError('API access forbidden. Check API key', 403);
        default:
          throw new MatchApiError(
            `Failed to fetch player data (${response.status})`,
            response.status >= 500 ? 502 : 400,
          );
      }
    }

    const data = await response.json();

    if (typeof data.puuid !== 'string') {
      log.error('Unexpected response shape when fetching player PUUID', { data });
      throw new MatchApiError('Invalid response from Riot API', 502);
    }

    return data.puuid;
  } catch (error) {
    // Re-throw MatchApiError as-is
    if (error instanceof MatchApiError) {
      throw error;
    }

    // Handle network/timeout errors
    log.error('Network error when fetching player PUUID', { error, gameName, tagLine });
    throw new MatchApiError('Failed to connect to Riot API. Please try again later', 503, {
      originalError: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Server-side function to fetch the current match data of a player by their PUUID.
 * @param {string} puuid - The player's PUUID.
 * @returns {Promise<TParticipant[]>} A promise of the current match participants.
 */
async function getCurrentMatchByPUUID(puuid: string): Promise<TParticipant[]> {
  const riotApiKey = process.env.NEXT_RIOT_API_KEY;
  const log = logger.child('match-service:fetch-current-match');

  if (Strings.isBlank(riotApiKey)) {
    log.error('Riot API key is not set in environment variables');
    throw new MatchApiError('Server configuration error', 500);
  }

  try {
    const response = await fetch(
      `https://euw1.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`,
      {
        headers: {
          accept: 'application/json',
          'X-Riot-Token': riotApiKey!,
        },
        signal: AbortSignal.timeout(5000),
        next: {
          revalidate: 120, // 2 minutes cache
          tags: ['CurrentMatch', `CurrentMatch-${puuid}`],
        },
      },
    );

    if (!response.ok) {
      log.error(
        `Failed to fetch current match for PUUID ${puuid}: ${response.status}, ${response.statusText}`,
      );

      // Map Riot API status codes to appropriate errors
      switch (response.status) {
        case 404:
          throw new MatchApiError('Player is not currently in an active game', 404, { puuid });
        case 429:
          throw new MatchApiError('Rate limit exceeded. Please try again later', 429);
        case 403:
          throw new MatchApiError('API access forbidden. Check API key', 403);
        default:
          throw new MatchApiError(
            `Failed to fetch match data (${response.status})`,
            response.status >= 500 ? 502 : 400,
          );
      }
    }

    const data = await response.json();
    const champions = await getLatestChampions();

    return data.participants.map(
      (participant: { puuid: string; teamId: number; riotId: string; championId: number }) => ({
        puuid: participant.puuid,
        teamId: participant.teamId,
        riotId: participant.riotId,
        championId: participant.championId,
        championName:
          champions.find((champion) => champion.key === String(participant.championId))?.name ||
          'Unknown Champion',
      }),
    ) as TParticipant[];
  } catch (error) {
    // Re-throw MatchApiError as-is
    if (error instanceof MatchApiError) {
      throw error;
    }

    // Handle network/timeout errors
    log.error('Network error when fetching current match', { error, puuid });
    throw new MatchApiError('Failed to connect to Riot API. Please try again later', 503, {
      originalError: error instanceof Error ? error.message : String(error),
    });
  }
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
