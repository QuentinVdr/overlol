import { TOverlay } from '@/types/OverlayType';
import { TeamEnum } from '@/types/TeamEnum';
import { UseFormRegister } from 'react-hook-form';

type PlayerFormProps = {
  register: UseFormRegister<TOverlay>;
  fieldPrefix: `${TeamEnum}.${number}`;
};

export function PlayerForm({ register, fieldPrefix }: Readonly<PlayerFormProps>) {
  return (
    <div className="flex flex-row gap-2">
      <div className="flex grow flex-col">
        <label htmlFor={`champion-${fieldPrefix}`} className="pb-1 pl-0.5 text-xs text-gray-500">
          Champion
        </label>
        <input
          id={`champion-${fieldPrefix}`}
          type="text"
          className="grow rounded-lg border border-gray-300 bg-white px-2 py-1 shadow-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          {...register(`${fieldPrefix}.championName`)}
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor={`team-${fieldPrefix}`} className="pb-1 pl-0.5 text-xs text-gray-500">
          Équipe
        </label>
        <input
          id={`team-${fieldPrefix}`}
          type="text"
          className="w-32 rounded-lg border border-gray-300 bg-white px-2 py-1 shadow-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          {...register(`${fieldPrefix}.teamName`)}
        />
      </div>
      <div className="flex grow flex-col">
        <label htmlFor={`player-${fieldPrefix}`} className="pb-1 pl-0.5 text-xs text-gray-500">
          Joueur
        </label>
        <input
          id={`player-${fieldPrefix}`}
          type="text"
          className="grow rounded-lg border border-gray-300 bg-white px-2 py-1 shadow-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          {...register(`${fieldPrefix}.playerName`)}
        />
      </div>
    </div>
  );
}
