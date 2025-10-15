import { TOverlay } from '@/types/OverlayType';
import { TeamEnum } from '@/types/TeamEnum';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { PlayerForm } from './PlayerForm';

type PlayersFormProps = {
  register: UseFormRegister<TOverlay>;
  setValue: UseFormSetValue<TOverlay>;
  teamName: TeamEnum;
};

export function PlayersForm({ register, setValue, teamName }: Readonly<PlayersFormProps>) {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <PlayerForm
          key={`${teamName}-${i}`}
          register={register}
          setValue={setValue}
          fieldPrefix={`${teamName}.${i}`}
        />
      ))}
    </div>
  );
}
