import { CreateOverlayForm } from '@/components/OverlayForm/CreateOverlayForm';

export default function Home() {
  return (
    <main className="flex h-full w-full flex-col gap-4 px-3 py-2 md:px-8">
      <h1>Lol spec overlay generator</h1>
      <CreateOverlayForm />
    </main>
  );
}
