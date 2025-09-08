import { ReactQueryProvider } from '@/contexts/ReactQueryProvider';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OverLol',
  description: 'App to generate overlay for League of Legends spec game',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          defer
          src="https://umami.quentin-verdier.com/script.js"
          data-website-id="9c8e3cf9-d259-4bd1-b005-0fb28a20757c"
        ></script>
      </head>
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
