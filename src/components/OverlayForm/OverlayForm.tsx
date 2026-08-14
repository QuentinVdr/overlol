'use client';

import { kcPlayerNameAndTeamList } from '@/lib/KcPlayerList';
import { TOverlay } from '@/types/OverlayType';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { CurrentGameFetchForm } from './CurrentGameFetchForm';
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
  const { register, handleSubmit, setValue, getValues, watch, control } = useForm<TOverlay>({
    defaultValues: {
      ...(defaultValues || {
        blueTeam: Array.from({ length: 5 }, () => ({
          playerName: '',
          championName: '',
          championImage: '',
          teamName: '',
        })),
        redTeam: Array.from({ length: 5 }, () => ({
          playerName: '',
          championName: '',
          championImage: '',
          teamName: '',
        })),
        kcPlayerSpec: '',
      }),
    },
  });

  const [blueTeam, redTeam, kcPlayerSpec] = watch(['blueTeam', 'redTeam', 'kcPlayerSpec']);

  useEffect(() => {
    if (kcPlayerSpec) return;
    const match = [...(blueTeam ?? []), ...(redTeam ?? [])].find((player) =>
      kcPlayerNameAndTeamList.some((kc) => kc.name === player.playerName),
    );
    if (match) setValue('kcPlayerSpec', match.playerName);
  }, [blueTeam, redTeam, kcPlayerSpec, setValue]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row flex-wrap items-start gap-4">
        <CurrentGameFetchForm setValue={setValue} />
        <div className="flex flex-col">
          <label htmlFor="kcPlayerSpec" className="pb-1 pl-0.5 text-gray-500">
            Spectated KC player:
          </label>
          <select
            id="kcPlayerSpec"
            className="rounded-lg border border-gray-300 bg-white px-2 py-1 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            {...register('kcPlayerSpec')}
          >
            <option value="">None</option>
            {kcPlayerNameAndTeamList.map(({ name, team }) => (
              <option key={name} value={name}>
                {name} ({team})
              </option>
            ))}
          </select>
        </div>
      </div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-row flex-wrap gap-4">
          <div className="basis-xl flex grow flex-col gap-2 rounded-2xl border border-blue-600 bg-blue-50 px-5 py-3">
            <h2 className={`text-blue-600`}>Blue team</h2>
            <PlayersForm
              register={register}
              setValue={setValue}
              getValues={getValues}
              control={control}
              teamName="blueTeam"
            />
          </div>
          <div className="basis-xl flex grow flex-col gap-2 rounded-2xl border border-red-600 bg-red-50 px-5 py-3">
            <h2 className={`text-red-600`}>Red team</h2>
            <PlayersForm
              register={register}
              setValue={setValue}
              getValues={getValues}
              control={control}
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
