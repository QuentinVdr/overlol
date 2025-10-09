'use client';

import type { TOverlay } from '@/types/OverlayType';
import { useRouter } from 'next/navigation';
import type { SubmitHandler } from 'react-hook-form';
import { OverlayForm } from './OverlayForm';

export function CreateOverlayForm() {
  const router = useRouter();

  const onSubmit: SubmitHandler<TOverlay> = async (data) => {
    try {
      await fetch('/api/overlay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(async (res) => {
        const result = await res.json();
        router.push(`/${result.overlayId}`);
      });
    } catch (error) {
      console.error('Error creating overlay:', error);
    }
  };

  return <OverlayForm onSubmit={onSubmit} />;
}
