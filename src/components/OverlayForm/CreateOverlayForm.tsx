'use client';

import { TOverlay } from '@/types/OverlayType';
import { useRouter } from 'next/navigation';
import { SubmitHandler } from 'react-hook-form';
import { OverlayForm } from './OverlayForm';

export function CreateOverlayForm() {
  const router = useRouter();

  const onSubmit: SubmitHandler<TOverlay> = async (data) => {
    await fetch('/api/overlay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(async (res) => {
      const result = await res.json();
      router.push(`/${result.overlayId}`);
    });
  };

  return <OverlayForm onSubmit={onSubmit} />;
}
