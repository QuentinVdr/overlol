'use client';

import { TOverlay } from '@/types/OverlayType';
import { Strings } from '@/utils/stringUtils';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { PlayersForm } from './PlayersForm/PlayersForm';

type OverlayFormProps = {
  onSubmit: SubmitHandler<TOverlay>;
  submitLabel?: string;
  defaultValues?: TOverlay;
};

export function OverlayForm({
  onSubmit,
  submitLabel = 'Generate Overlay',
  defaultValues,
}: Readonly<OverlayFormProps>) {
  const {
    register: registerMatchOf,
    handleSubmit: handleMatchOfSubmit,
    formState: { errors: matchOfErrors },
    setError,
  } = useForm<{ matchOf: string }>();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, getValues } = useForm<TOverlay>({
    defaultValues: {
      ...(defaultValues || {
        blueTeam: Array.from({ length: 5 }, () => ({
          playerName: '',
          championName: '',
          teamName: '',
        })),
        redTeam: Array.from({ length: 5 }, () => ({
          playerName: '',
          championName: '',
          teamName: '',
        })),
      }),
    },
  });

  const handleSearchMatchOf = async (data: { matchOf: string }) => {
    const matchOf = data.matchOf.trim();

    if (Strings.isBlank(matchOf)) {
      return;
    }

    const [gameName, tagLine] = matchOf.split('#');
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
          playerName: p.riotId?.replace(/#[^#]*$/, '') || '',
          championName: p.championName || '',
          teamName: '',
        }));
      const redTeam = participants
        .filter((p: { teamId: number }) => p.teamId === 200)
        .map((p: { riotId?: string; championName?: string }) => ({
          playerName: p.riotId?.replace(/#[^#]*$/, '') || '',
          championName: p.championName || '',
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
    <div className="flex flex-col gap-6">
      <form
        className="flex w-full flex-row items-center gap-4"
        onSubmit={handleMatchOfSubmit(handleSearchMatchOf)}
      >
        <div className="flex w-100 flex-col">
          <label htmlFor="matchOf" className="pb-1 pl-0.5 text-gray-500">
            Load data from match of :
          </label>
          <input
            id="matchOf"
            type="text"
            className="rounded-lg border border-gray-300 bg-white px-2 py-1 shadow-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="gameName#tagLine"
            {...registerMatchOf('matchOf', {
              pattern: {
                value: /^[^#]+#[^#]+$/,
                message: 'Format must be gameName#tagLine',
              },
            })}
          />
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
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-row flex-wrap gap-4">
          <div
            className={`flex grow basis-xl flex-col gap-2 rounded-2xl border border-blue-600 bg-blue-50 px-5 py-3`}
          >
            <h2 className={`text-blue-600`}>Blue team</h2>
            <PlayersForm
              register={register}
              setValue={setValue}
              getValues={getValues}
              teamName="blueTeam"
            />
          </div>
          <div
            className={`flex grow basis-xl flex-col gap-2 rounded-2xl border border-red-600 bg-red-50 px-5 py-3`}
          >
            <h2 className={`text-red-600`}>Red team</h2>
            <PlayersForm
              register={register}
              setValue={setValue}
              getValues={getValues}
              teamName="redTeam"
            />
          </div>
        </div>
        <button
          type="submit"
          className="self-center rounded-2xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
