import { TChampion } from '@/types/ChampionType';
import { TOverlay } from '@/types/OverlayType';
import { TeamEnum } from '@/types/TeamEnum';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { PlayerForm } from './PlayerForm';

type PlayersFormProps = {
  register: UseFormRegister<TOverlay>;
  setValue: UseFormSetValue<TOverlay>;
  teamName: TeamEnum;
  champions: TChampion[];
};

export function PlayersForm({
  register,
  setValue,
  teamName,
  champions,
}: Readonly<PlayersFormProps>) {
  return (
    <div className="flex flex-col gap-2">
      <PlayerForm
        register={register}
        setValue={setValue}
        fieldPrefix={`${teamName}.0`}
        champions={champions}
      />
      <PlayerForm
        register={register}
        setValue={setValue}
        fieldPrefix={`${teamName}.1`}
        champions={champions}
      />
      <PlayerForm
        register={register}
        setValue={setValue}
        fieldPrefix={`${teamName}.2`}
        champions={champions}
      />
      <PlayerForm
        register={register}
        setValue={setValue}
        fieldPrefix={`${teamName}.3`}
        champions={champions}
      />
      <PlayerForm
        register={register}
        setValue={setValue}
        fieldPrefix={`${teamName}.4`}
        champions={champions}
      />
    </div>
  );
}
