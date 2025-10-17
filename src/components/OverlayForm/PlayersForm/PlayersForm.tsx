'use client';

import { TOverlay } from '@/types/OverlayType';
import { TeamEnum } from '@/types/TeamEnum';
import { DragEvent, useState } from 'react';
import { UseFormGetValues, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { PlayerForm } from './PlayerForm';

type PlayersFormProps = {
  register: UseFormRegister<TOverlay>;
  setValue: UseFormSetValue<TOverlay>;
  getValues: UseFormGetValues<TOverlay>;
  teamName: TeamEnum;
};

export function PlayersForm({
  register,
  setValue,
  getValues,
  teamName,
}: Readonly<PlayersFormProps>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showIndicatorAbove, setShowIndicatorAbove] = useState<boolean>(false);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setShowIndicatorAbove(false);
  };

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
      // Show indicator above if dragging from below to above
      setShowIndicatorAbove(draggedIndex > index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
    setShowIndicatorAbove(false);
  };

  const handleDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    // Get current values from the form using react-hook-form
    const teamPlayers = getValues(teamName);
    if (!teamPlayers) return;

    // Create a new array with the reordered players
    const players = [...teamPlayers];

    // Remove the dragged player
    const [draggedPlayer] = players.splice(draggedIndex, 1);

    // Insert it at the drop position
    players.splice(dropIndex, 0, draggedPlayer);

    // Update the entire team array at once
    setValue(teamName, players, { shouldDirty: true });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <PlayerForm
          key={`${teamName}-${i}`}
          register={register}
          setValue={setValue}
          fieldPrefix={`${teamName}.${i}`}
          onDragStart={() => handleDragStart(i)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, i)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, i)}
          isDragging={draggedIndex === i}
          isDragOver={dragOverIndex === i}
          showIndicatorAbove={showIndicatorAbove && dragOverIndex === i}
        />
      ))}
    </div>
  );
}
