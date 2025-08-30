import { TOverlay } from '@/types/OverlayType';
import { SubmitHandler, useForm } from 'react-hook-form';
import { PlayerForm } from './PlayerForm';

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
  const { register, handleSubmit } = useForm<TOverlay>({
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
          <div className="flex flex-col gap-2">
            <PlayerForm register={register} fieldPrefix={'blueTeam.0'} />
            <PlayerForm register={register} fieldPrefix={'blueTeam.1'} />
            <PlayerForm register={register} fieldPrefix={'blueTeam.2'} />
            <PlayerForm register={register} fieldPrefix={'blueTeam.3'} />
            <PlayerForm register={register} fieldPrefix={'blueTeam.4'} />
          </div>
        </div>
        <div
          className={`flex grow basis-xl flex-col gap-2 rounded-2xl border border-red-600 bg-red-50 px-5 py-3`}
        >
          <h2 className={`text-red-600`}>Red team</h2>
          <div className="flex flex-col gap-2">
            <PlayerForm register={register} fieldPrefix={'redTeam.0'} />
            <PlayerForm register={register} fieldPrefix={'redTeam.1'} />
            <PlayerForm register={register} fieldPrefix={'redTeam.2'} />
            <PlayerForm register={register} fieldPrefix={'redTeam.3'} />
            <PlayerForm register={register} fieldPrefix={'redTeam.4'} />
          </div>
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
