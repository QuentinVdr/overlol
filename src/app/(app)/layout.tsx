import { ReactNode } from 'react';
import './style.css';

export default async function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
