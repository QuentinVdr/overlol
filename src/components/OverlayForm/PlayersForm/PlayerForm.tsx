import { TOverlay } from '@/types/OverlayType';
import { TeamEnum } from '@/types/TeamEnum';
import { DragEvent } from 'react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { ChampionField } from './ChampionField/ChampionField';

type PlayerFormProps = {
  register: UseFormRegister<TOverlay>;
  setValue: UseFormSetValue<TOverlay>;
  fieldPrefix: `${TeamEnum}.${number}`;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (e: DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: DragEvent) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  showIndicatorAbove?: boolean;
};

export function PlayerForm({
  register,
  setValue,
  fieldPrefix,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragging = false,
  isDragOver = false,
  showIndicatorAbove = false,
}: Readonly<PlayerFormProps>) {
  const clearPlayer = () => {
    setValue(`${fieldPrefix}.championName`, '');
    setValue(`${fieldPrefix}.playerName`, '');
    setValue(`${fieldPrefix}.teamName`, '');
  };

  return (
    <div className="relative">
      {isDragOver && (
        <div
          className={`absolute right-0 left-0 z-10 h-1 rounded-full bg-blue-500 shadow-lg ${
            showIndicatorAbove ? '-top-1' : '-bottom-1'
          }`}
        ></div>
      )}
      <div
        className={`flex flex-row gap-2 rounded-lg transition-all ${isDragging ? 'opacity-50' : ''}`}
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="flex cursor-move flex-col justify-center rounded bg-gray-200 px-1.5 text-gray-600 transition-colors hover:bg-gray-300 hover:text-gray-800">
          <span className="font-bold" title="Drag to reorder">
            ⋮⋮
          </span>
        </div>
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
          <ChampionField register={register} fieldPrefix={fieldPrefix} />
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
    </div>
  );
}
