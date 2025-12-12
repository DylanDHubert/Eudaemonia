'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ThemeColorUpdater from './components/ThemeColorUpdater';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeColorUpdater />
      {children}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
} 