'use client';

import { TeamForm } from '@/components/TeamForm';
import { TOverlay } from '@/types/OverlayType';
import { SubmitHandler, useForm } from 'react-hook-form';

export default function Home() {
  const { register, handleSubmit } = useForm<TOverlay>({
    defaultValues: {
      blueTeam: Array(5).fill({ playerName: '', championName: '', teamName: '' }),
      redTeam: Array(5).fill({ playerName: '', championName: '', teamName: '' }),
    },
  });
  const onSubmit: SubmitHandler<TOverlay> = (data) => console.log(data);

  return (
    <main className="flex h-screen w-screen flex-col gap-4 bg-zinc-100 px-3 py-2 md:px-8">
      <h1>Lol spec overlay generator</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-row flex-wrap gap-4">
          <TeamForm register={register} teamName="blueTeam" />
          <TeamForm register={register} teamName="redTeam" />
        </div>
        <button
          type="submit"
          className="self-center rounded-2xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Generate Overlay
        </button>
      </form>
    </main>
  );
}
