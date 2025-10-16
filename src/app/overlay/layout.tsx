import { ReactNode } from 'react';
import './style.css';

export default async function OverlayLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
