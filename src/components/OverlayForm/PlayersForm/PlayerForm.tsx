import { TOverlay } from '@/types/OverlayType';
import { TeamEnum } from '@/types/TeamEnum';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';

type PlayerFormProps = {
  register: UseFormRegister<TOverlay>;
  setValue: UseFormSetValue<TOverlay>;
  fieldPrefix: `${TeamEnum}.${number}`;
};

export function PlayerForm({ register, setValue, fieldPrefix }: Readonly<PlayerFormProps>) {
  const clearPlayer = () => {
    setValue(`${fieldPrefix}.championName`, '');
    setValue(`${fieldPrefix}.playerName`, '');
    setValue(`${fieldPrefix}.teamName`, '');
  };

  return (
    <div className="flex flex-row gap-2">
      <div className="flex w-20 flex-col">
        <label htmlFor={`team-${fieldPrefix}`} className="pb-1 pl-0.5 text-xs text-gray-500">
          Équipe
        </label>
        <input
          id={`team-${fieldPrefix}`}
          type="text"
          className="rounded-lg border border-gray-300 bg-white px-2 py-1 shadow-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
      <div className="flex flex-col justify-end">
        <button
          type="button"
          onClick={clearPlayer}
          className="rounded-lg border border-red-300 bg-red-50 px-3 py-1 text-red-600 transition-all hover:border-red-400 hover:bg-red-100"
          title="Clear player"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
