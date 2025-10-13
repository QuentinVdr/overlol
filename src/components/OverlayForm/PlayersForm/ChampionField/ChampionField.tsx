'use client';

import { TChampion } from '@/types/ChampionType';
import { TOverlay } from '@/types/OverlayType';
import { TeamEnum } from '@/types/TeamEnum';
import { UseFormRegister } from 'react-hook-form';

type ChampionFieldProps = {
  register: UseFormRegister<TOverlay>;
  fieldPrefix: `${TeamEnum}.${number}`;
  champions: TChampion[];
};

export function ChampionField({ register, fieldPrefix, champions }: Readonly<ChampionFieldProps>) {
  return (
    <>
      <label htmlFor={`champion-${fieldPrefix}`} className="pb-1 pl-0.5 text-xs text-gray-500">
        Champion
      </label>
      <input
        id={`champion-${fieldPrefix}`}
        type="text"
        className="grow rounded-lg border border-gray-300 bg-white px-2 py-1 shadow-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        list={`champion-list-${fieldPrefix}`}
        autoComplete="off"
        {...register(`${fieldPrefix}.championName`)}
      />
      <datalist id={`champion-list-${fieldPrefix}`}>
        {champions && Array.isArray(champions)
          ? champions.map((champ: TChampion) => <option key={champ.id} value={champ.name} />)
          : null}
      </datalist>
    </>
  );
}
