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
      <body>{children}</body>
    </html>
  );
}
