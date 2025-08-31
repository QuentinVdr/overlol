'use client';

import { TOverlay } from '@/types/OverlayType';
import { redirect } from 'next/navigation';
import { SubmitHandler } from 'react-hook-form';
import { OverlayForm } from './OverlayForm';

export function CreateOverlayForm() {
  const onSubmit: SubmitHandler<TOverlay> = async (data) => {
    await fetch('/api/overlay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(async (res) => {
      const result = await res.json();
      redirect(`/${result.overlayId}`);
    });
  };

  return <OverlayForm onSubmit={onSubmit} />;
}
