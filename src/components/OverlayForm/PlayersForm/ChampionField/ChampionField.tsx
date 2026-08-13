'use client';

import { useChampions } from '@/context/ChampionsContext';
import type { TChampion } from '@/types/ChampionType';
import type { TOverlay } from '@/types/OverlayType';
import type { TeamEnum } from '@/types/TeamEnum';
import Image from 'next/image';
import { useEffect, useId, useMemo, useState, type FocusEvent, type KeyboardEvent } from 'react';
import {
  useWatch,
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';

type ChampionFieldProps = {
  register: UseFormRegister<TOverlay>;
  setValue: UseFormSetValue<TOverlay>;
  control: Control<TOverlay>;
  fieldPrefix: `${TeamEnum}.${number}`;
};

export function ChampionField({
  register,
  setValue,
  control,
  fieldPrefix,
}: Readonly<ChampionFieldProps>) {
  const champions = useChampions();
  const listId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const name = `${fieldPrefix}.championName` as const;
  const value = useWatch({ control, name }) ?? '';
  const { onChange, onBlur, ...registerRest } = register(name);

  const filteredChampions = useMemo(() => {
    const search = value.trim().toLowerCase();
    if (!search) return champions ?? [];
    return (champions ?? []).filter((champ) => champ.name.toLowerCase().includes(search));
  }, [champions, value]);

  const selectedChampion = champions?.find((champ) => champ.name === value);

  useEffect(() => {
    if (!highlightedIndex) return;
    document
      .getElementById(`${listId}-${filteredChampions[highlightedIndex]?.id}`)
      ?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      });
  }, [isOpen, highlightedIndex, filteredChampions, listId]);

  const imageName = `${fieldPrefix}.championImage` as const;

  const select = (champ: TChampion) => {
    setValue(name, champ.name, { shouldDirty: true, shouldValidate: true });
    setValue(imageName, champ.image, { shouldDirty: true, shouldValidate: true });
    setIsOpen(false);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    onBlur(e);
    const typed = value.trim().toLowerCase();
    const match = (champions ?? []).find((champ) => champ.name.toLowerCase() === typed);
    setValue(name, match?.name ?? '', { shouldDirty: true, shouldValidate: true });
    setValue(imageName, match?.image ?? '', { shouldDirty: true, shouldValidate: true });
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((i) => Math.min(i + 1, filteredChampions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && isOpen && filteredChampions[highlightedIndex]) {
      e.preventDefault();
      select(filteredChampions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const highlighted = isOpen ? filteredChampions[highlightedIndex] : undefined;

  return (
    <div className="flex grow flex-col">
      <label htmlFor={`champion-${fieldPrefix}`} className="pb-1 pl-0.5 text-xs text-gray-500">
        Champion
      </label>
      <div className="relative flex grow">
        {selectedChampion && (
          <Image
            src={selectedChampion.image}
            alt=""
            width={20}
            height={20}
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 rounded"
          />
        )}
        <input
          id={`champion-${fieldPrefix}`}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-activedescendant={highlighted ? `${listId}-${highlighted.id}` : undefined}
          className={`grow rounded-lg border border-gray-300 bg-white py-1 pl-8 pr-2 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
          autoComplete="off"
          {...registerRest}
          onChange={(e) => {
            onChange(e);
            setHighlightedIndex(0);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        {isOpen && filteredChampions.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            className="absolute top-full z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg"
          >
            {filteredChampions.map((champ, index) => (
              <li
                key={champ.id}
                id={`${listId}-${champ.id}`}
                role="option"
                aria-selected={index === highlightedIndex}
                className={`flex cursor-pointer items-center gap-2 px-2 py-1 ${
                  index === highlightedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => select(champ)}
              >
                <Image
                  src={champ.image}
                  alt=""
                  width={24}
                  height={24}
                  loading="lazy"
                  className="rounded"
                />
                <span>{champ.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
