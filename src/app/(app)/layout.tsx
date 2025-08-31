export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <body className="bg-zinc-100">{children}</body>;
}
