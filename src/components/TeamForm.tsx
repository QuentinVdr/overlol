import { TOverlay } from '@/types/OverlayType';
import { TeamEnum } from '@/types/TeamEnum';
import { UseFormRegister } from 'react-hook-form';
import { PlayerForm } from './PlayerForm';

type TeamFormProps = {
  register: UseFormRegister<TOverlay>;
  teamName: TeamEnum;
};

export function TeamForm({ register, teamName }: Readonly<TeamFormProps>) {
  const isBlueTeam = teamName === 'blueTeam';

  return (
    <div
      className={`flex grow basis-xl flex-col gap-2 rounded-2xl border ${isBlueTeam ? 'border-blue-600 bg-blue-50' : 'border-red-600 bg-red-50'} px-5 py-3`}
    >
      <h2 className={`text-${isBlueTeam ? 'blue' : 'red'}-600`}>
        {isBlueTeam ? 'Blue team' : 'Red team'}
      </h2>
      <div className="flex flex-col gap-2">
        <PlayerForm register={register} teamName={teamName} playerIndex={0} />
        <PlayerForm register={register} teamName={teamName} playerIndex={1} />
        <PlayerForm register={register} teamName={teamName} playerIndex={2} />
        <PlayerForm register={register} teamName={teamName} playerIndex={3} />
        <PlayerForm register={register} teamName={teamName} playerIndex={4} />
      </div>
    </div>
  );
}
