import { TOverlay } from '@/types/OverlayType';
import { TeamEnum } from '@/types/TeamEnum';
import { DragEvent, useState } from 'react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { PlayerForm } from './PlayerForm';

type PlayersFormProps = {
  register: UseFormRegister<TOverlay>;
  setValue: UseFormSetValue<TOverlay>;
  teamName: TeamEnum;
};

export function PlayersForm({ register, setValue, teamName }: Readonly<PlayersFormProps>) {
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

    // Get current values from the form
    const players = [0, 1, 2, 3, 4].map((i) => ({
      playerName:
        (document.getElementById(`player-${teamName}.${i}`) as HTMLInputElement)?.value || '',
      championName:
        (document.getElementById(`champion-${teamName}.${i}`) as HTMLInputElement)?.value || '',
      teamName: (document.getElementById(`team-${teamName}.${i}`) as HTMLInputElement)?.value || '',
    }));

    // Insert the dragged player at the drop position
    // Remove the dragged player from its original position
    const [draggedPlayer] = players.splice(draggedIndex, 1);

    // Calculate the correct insertion index
    // If dragging down, the index doesn't need adjustment
    // If dragging up, insert at the exact dropIndex
    const insertIndex = draggedIndex < dropIndex ? dropIndex : dropIndex;

    // Insert at the target position
    players.splice(insertIndex, 0, draggedPlayer);

    // Update all players in the form
    players.forEach((player, index) => {
      setValue(`${teamName}.${index}.playerName`, player.playerName);
      setValue(`${teamName}.${index}.championName`, player.championName);
      setValue(`${teamName}.${index}.teamName`, player.teamName);
    });

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
