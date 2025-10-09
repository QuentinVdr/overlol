'use client';

import type { TOverlay } from '@/types/OverlayType';
import type { SubmitHandler } from 'react-hook-form';
import { OverlayForm } from './OverlayForm';

type UpdateOverlayFormProps = {
  id: string;
  overlay: TOverlay;
};

export function UpdateOverlayForm({ id, overlay }: Readonly<UpdateOverlayFormProps>) {
  const onSubmit: SubmitHandler<TOverlay> = async (data) => {
    try {
      const response = await fetch(`/api/overlay/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to update overlay: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating overlay:', error);
    }
  };

  return <OverlayForm onSubmit={onSubmit} submitLabel="Update Overlay" defaultValues={overlay} />;
}
