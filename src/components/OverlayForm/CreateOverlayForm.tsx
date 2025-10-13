'use client';

import { createOverlay } from '@/lib/overlayActions';
import type { TChampion } from '@/types/ChampionType';
import type { TOverlay } from '@/types/OverlayType';
import { useRouter } from 'next/navigation';
import type { SubmitHandler } from 'react-hook-form';
import { OverlayForm } from './OverlayForm';

type CreateOverlayFormProps = {
  champions: TChampion[];
};

export function CreateOverlayForm({ champions }: Readonly<CreateOverlayFormProps>) {
  const router = useRouter();

  const handleSubmit: SubmitHandler<TOverlay> = async (data) => {
    try {
      const result = await createOverlay(data);
      if (result.success) {
        if (result.data?.overlayId) {
          router.push(`/${result.data.overlayId}`);
        } else {
          console.error('Error creating overlay: No overlay ID returned');
        }
      } else {
        console.error('Error creating overlay:', result.error);
      }
    } catch (error) {
      console.error('Error creating overlay:', error);
    }
  };

  return <OverlayForm onSubmit={handleSubmit} champions={champions} />;
}
