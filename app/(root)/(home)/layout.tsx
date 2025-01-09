import { Metadata } from 'next';
import { ReactNode } from 'react';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'POLYCOMM',
  description: 'A workspace for your team, powered by Stream Chat and Clerk.',
};

const RootLayout = ({ children }: Readonly<{children: ReactNode}>) => {
  return (
    <main className="relative min-h-screen bg-slate-100">
      <div className="absolute inset-0 bg-grid-pattern bg-[size:20px_20px] opacity-30"></div>
      <Navbar />

      <div className="relative z-10 flex">
        <Sidebar />
        
        <section className="flex min-h-screen flex-1 flex-col px-4 pb-6 pt-24 max-md:pb-14 sm:px-6 lg:px-8">
          <div className="w-full rounded-xl bg-slate-200/95 p-5 shadow-glass backdrop-blur-sm lg:p-6">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
};

export default RootLayout;
