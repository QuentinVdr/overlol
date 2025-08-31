'use client';

import { TOverlay } from '@/types/OverlayType';
import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { OverlayForm } from './OverlayForm';

type UpdateOverlayFormProps = {
  id: string;
};

export function UpdateOverlayForm({ id }: Readonly<UpdateOverlayFormProps>) {
  const [overlayData, setOverlayData] = useState();
  fetch(`/api/overlay/${id}`).then(async (res) => {
    const data = await res.json();
    console.log('🚀 ~ overlayData:', data);
    setOverlayData(data);
  });

  const onSubmit: SubmitHandler<TOverlay> = async (data) => {
    await fetch(`/api/overlay/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(async (res) => {
      const result = await res.json();
      console.log('🚀 ~ onSubmit ~ result:', result);
    });
  };

  if (!overlayData) {
    return <div>Loading...</div>;
  }

  return (
    <OverlayForm onSubmit={onSubmit} submitLabel="Update Overlay" defaultValues={overlayData} />
  );
}
