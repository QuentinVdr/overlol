'use client';

import { getCurrentMatchByGameNameAndTagLine } from '@/lib/matchApi';
import { TOverlay } from '@/types/OverlayType';
import { Strings } from '@/utils/stringUtils';
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

  const { register, handleSubmit, setValue } = useForm<TOverlay>({
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
    const { matchOf } = data;

    if (Strings.isBlank(matchOf)) {
      return;
    }

    const [gameName, tagLine] = matchOf.split('#');
    try {
      const participants = await getCurrentMatchByGameNameAndTagLine(gameName, tagLine);
      const blueTeam = participants
        .filter((p) => p.teamId === 100)
        .map((p) => ({
          playerName: p.riotId.replace(/#[^#]*$/, '') || '',
          championName: p.championName || '',
          teamName: '',
        }));
      const redTeam = participants
        .filter((p) => p.teamId === 200)
        .map((p) => ({
          playerName: p.riotId.replace(/#[^#]*$/, '') || '',
          championName: p.championName || '',
          teamName: '',
        }));
      setValue('blueTeam', blueTeam);
      setValue('redTeam', redTeam);
    } catch (error: any) {
      setError('matchOf', {
        type: 'manual',
        message: error.message,
      });
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
          className="self-center rounded-2xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          type="submit"
        >
          Load data
        </button>
      </form>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-row flex-wrap gap-4">
          <div
            className={`flex grow basis-xl flex-col gap-2 rounded-2xl border border-blue-600 bg-blue-50 px-5 py-3`}
          >
            <h2 className={`text-blue-600`}>Blue team</h2>
            <PlayersForm register={register} setValue={setValue} teamName="blueTeam" />
          </div>
          <div
            className={`flex grow basis-xl flex-col gap-2 rounded-2xl border border-red-600 bg-red-50 px-5 py-3`}
          >
            <h2 className={`text-red-600`}>Red team</h2>
            <PlayersForm register={register} setValue={setValue} teamName="redTeam" />
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
