import { kcPlayerList } from '@/lib/KcPlayerList';
import { TOverlay } from '@/types/OverlayType';
import { Strings } from '@/utils/stringUtils';
import { useMemo, useState } from 'react';
import { useForm, UseFormSetValue } from 'react-hook-form';

type CurrentGameFetchFormProps = {
  setValue: UseFormSetValue<TOverlay>;
};

export function CurrentGameFetchForm({ setValue }: Readonly<CurrentGameFetchFormProps>) {
  const {
    register: registerMatchOf,
    handleSubmit: handleMatchOfSubmit,
    formState: { errors: matchOfErrors },
    setError,
  } = useForm<{ matchOf: string }>();
  const [loading, setLoading] = useState(false);

  const kcPlayerMap = useMemo(() => {
    const map = new Map<string, string>();
    Object.keys(kcPlayerList).forEach((kcPlayer) => {
      kcPlayerList[kcPlayer].forEach((account) => {
        map.set(`${account.riotPseudo}#${account.tagLine}`.toLowerCase(), kcPlayer);
      });
    });
    return map;
  }, []);

  const getKcPlayerInfo = (riotId: string, championName: string) => {
    const playerName =
      (kcPlayerMap.get(riotId.toLowerCase()) ?? riotId.replace(/#[^#]*$/, '')) || '';
    if (playerName.toLowerCase() === championName.toLowerCase()) {
      return '';
    }
    return playerName;
  };

  const handleSearchMatchOf = async (data: { matchOf: string }) => {
    const matchOf = data.matchOf.trim();

    if (Strings.isBlank(matchOf)) {
      return;
    }

    const [gameName, tagLine] = matchOf.split('#').map((part) => part.trim());
    if (Strings.isBlank(gameName) || Strings.isBlank(tagLine)) {
      setError('matchOf', {
        type: 'manual',
        message: 'Format must be gameName#tagLine',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/match/current?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load match data');
      }

      const { participants } = await response.json();
      const blueTeam = participants
        .filter((p: { teamId: number }) => p.teamId === 100)
        .map((p: { riotId?: string; championName?: string }) => ({
          playerName: getKcPlayerInfo(p.riotId ?? '', p.championName ?? ''),
          championName: p.championName ?? '',
          teamName: '',
        }));
      const redTeam = participants
        .filter((p: { teamId: number }) => p.teamId === 200)
        .map((p: { riotId?: string; championName?: string }) => ({
          playerName: getKcPlayerInfo(p.riotId ?? '', p.championName ?? ''),
          championName: p.championName ?? '',
          teamName: '',
        }));
      setValue('blueTeam', blueTeam);
      setValue('redTeam', redTeam);
    } catch (error: unknown) {
      setError('matchOf', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'Failed to load match data',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="flex w-full flex-row items-center gap-4"
      onSubmit={handleMatchOfSubmit(handleSearchMatchOf)}
    >
      <div className="w-100 flex flex-col">
        <label htmlFor="matchOf" className="pb-1 pl-0.5 text-gray-500">
          Load data from match of :
        </label>
        <input
          id="matchOf"
          type="text"
          className="rounded-lg border border-gray-300 bg-white px-2 py-1 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          placeholder="gameName#tagLine"
          {...registerMatchOf('matchOf', {
            pattern: {
              value: /^[^#]+#[^#]+$/,
              message: 'Format must be gameName#tagLine',
            },
          })}
          list="matchOfSuggestions"
        />
        <datalist id="matchOfSuggestions">
          {Array.from(kcPlayerMap.keys()).map((inputId) => (
            <option key={inputId} value={inputId} />
          ))}
        </datalist>
        {matchOfErrors.matchOf && (
          <p className="text-xs text-red-500">{matchOfErrors.matchOf.message}</p>
        )}
      </div>
      <button
        className="self-center rounded-2xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Load data'}
      </button>
    </form>
  );
}
