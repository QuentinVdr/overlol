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
      <PlayerForm register={register} setValue={setValue} fieldPrefix={`${teamName}.0`} />
      <PlayerForm register={register} setValue={setValue} fieldPrefix={`${teamName}.1`} />
      <PlayerForm register={register} setValue={setValue} fieldPrefix={`${teamName}.2`} />
      <PlayerForm register={register} setValue={setValue} fieldPrefix={`${teamName}.3`} />
      <PlayerForm register={register} setValue={setValue} fieldPrefix={`${teamName}.4`} />
    </div>
  );
}
