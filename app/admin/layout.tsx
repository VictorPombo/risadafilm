'use client';

import { useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-[100dvh] w-full overflow-hidden bg-[#0a0a0a]">
        {/* Glow superior esquerdo */}
        <div style={{
          position: 'fixed',
          top: '-200px',
          left: '-200px',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(245,197,24,0.12) 0%, rgba(245,197,24,0.04) 40%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Glow inferior direito */}
        <div style={{
          position: 'fixed',
          bottom: '-200px',
          right: '-200px',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(245,197,24,0.08) 0%, transparent 65%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Grid de pontos — aumentar opacidade */}
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header */}
          <div className="md:hidden shrink-0 bg-[#111111] border-b border-[#222222] px-4 py-3 flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0f0f0" strokeWidth="1.5">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className="font-display font-bold text-[#f5c518]">Risada Film</span>
          </div>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto relative z-10 p-5 md:p-10 pb-20 md:pb-10">
            <div className="max-w-[1300px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
