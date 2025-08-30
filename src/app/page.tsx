'use client';

import { OverlayForm } from '@/components/OverlayForm';
import { TOverlay } from '@/types/OverlayType';
import { SubmitHandler, useForm } from 'react-hook-form';

export default function Home() {
  const { register, handleSubmit } = useForm<TOverlay>({
    defaultValues: {
      blueTeam: Array(5).fill({ playerName: '', championName: '', teamName: '' }),
      redTeam: Array(5).fill({ playerName: '', championName: '', teamName: '' }),
    },
  });
  const onSubmit: SubmitHandler<TOverlay> = async (data) => {
    console.log(data);
    await fetch('/api/overlay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(async (res) => {
      const result = await res.json();
      console.log(result);
    });
  };

  return (
    <main className="flex h-screen w-screen flex-col gap-4 bg-zinc-100 px-3 py-2 md:px-8">
      <h1>Lol spec overlay generator</h1>
      <OverlayForm onSubmit={onSubmit} />
    </main>
  );
}
