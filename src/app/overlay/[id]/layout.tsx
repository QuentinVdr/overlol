import { redirect } from 'next/navigation';

export default async function OverlayLayout({
  params,
  children,
}: Readonly<{
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}>) {
  const id = await params;
  if (!id) {
    redirect('/');
  }
  return <body className="relative h-[1080px] w-[1920px] bg-transparent">{children}</body>;
}
