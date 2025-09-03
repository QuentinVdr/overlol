import { ReactQueryProvider } from '@/contexts/ReactQueryProvider';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <body className="bg-zinc-100">
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </body>
  );
}
