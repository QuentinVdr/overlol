'use client';

import { TChampion } from '@/types/ChampionType';
import { TOverlay } from '@/types/OverlayType';
import { SubmitHandler, useForm } from 'react-hook-form';
import { PlayersForm } from './PlayersForm/PlayersForm';

type OverlayFormProps = {
  onSubmit: SubmitHandler<TOverlay>;
  submitLabel?: string;
  defaultValues?: TOverlay;
  champions: TChampion[];
};

export function OverlayForm({
  onSubmit,
  submitLabel = 'Generate Overlay',
  defaultValues,
  champions,
}: Readonly<OverlayFormProps>) {
  const { register, handleSubmit, setValue } = useForm<TOverlay>({
    defaultValues: {
      ...(defaultValues || {
        blueTeam: Array(5).fill({ playerName: '', championName: '', teamName: '' }),
        redTeam: Array(5).fill({ playerName: '', championName: '', teamName: '' }),
      }),
    },
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-row flex-wrap gap-4">
        <div
          className={`flex grow basis-xl flex-col gap-2 rounded-2xl border border-blue-600 bg-blue-50 px-5 py-3`}
        >
          <h2 className={`text-blue-600`}>Blue team</h2>
          <PlayersForm
            register={register}
            setValue={setValue}
            teamName="blueTeam"
            champions={champions}
          />
        </div>
        <div
          className={`flex grow basis-xl flex-col gap-2 rounded-2xl border border-red-600 bg-red-50 px-5 py-3`}
        >
          <h2 className={`text-red-600`}>Red team</h2>
          <PlayersForm
            register={register}
            setValue={setValue}
            teamName="redTeam"
            champions={champions}
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
  );
}
