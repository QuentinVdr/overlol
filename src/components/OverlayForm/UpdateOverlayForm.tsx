'use client';

import { updateOverlayAction } from '@/lib/overlayActions';
import type { TChampion } from '@/types/ChampionType';
import type { TOverlay } from '@/types/OverlayType';
import { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { OverlayForm } from './OverlayForm';

type UpdateOverlayFormProps = {
  id: string;
  overlay: TOverlay;
  champions: TChampion[];
};

export function UpdateOverlayForm({ id, overlay, champions }: Readonly<UpdateOverlayFormProps>) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{ success?: boolean; error?: string } | null>(
    null,
  );

  const onSubmit: SubmitHandler<TOverlay> = async (data) => {
    try {
      setIsUpdating(true);
      setUpdateStatus(null);

      const result = await updateOverlayAction(id, data);

      if (result.success) {
        setUpdateStatus({ success: true });
      } else {
        setUpdateStatus({ error: result.error || 'Failed to update overlay' });
      }
    } catch (error) {
      console.error('Error updating overlay:', error);
      setUpdateStatus({ error: 'Failed to update overlay' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <OverlayForm
        onSubmit={onSubmit}
        submitLabel={isUpdating ? 'Updating...' : 'Update Overlay'}
        defaultValues={overlay}
        champions={champions}
      />
      {updateStatus && (
        <div
          className={`mt-4 rounded-md p-3 ${updateStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
        >
          {updateStatus.success ? 'Overlay updated successfully!' : updateStatus.error}
        </div>
      )}
    </div>
  );
}
