'use client';

import { TOverlay } from '@/types/OverlayType';
import { useEffect, useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { OverlayForm } from './OverlayForm';

type UpdateOverlayFormProps = {
  id: string;
};

export function UpdateOverlayForm({ id }: Readonly<UpdateOverlayFormProps>) {
  const [overlayData, setOverlayData] = useState();

  useEffect(() => {
    fetch(`/api/overlay/${id}`).then(async (res) => {
      const data = await res.json();
      setOverlayData(data);
    });
  }, [id]);

  const onSubmit: SubmitHandler<TOverlay> = async (data) => {
    await fetch(`/api/overlay/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(async (res) => {
      if (res.ok) {
        const updatedData = await res.json();
        setOverlayData(updatedData);
      }
    });
  };

  if (!overlayData) {
    return <div>Loading...</div>;
  }

  return (
    <OverlayForm onSubmit={onSubmit} submitLabel="Update Overlay" defaultValues={overlayData} />
  );
}
