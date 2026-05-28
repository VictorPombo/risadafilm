'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Orçamentos',
    href: '/orcamentos',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: 'Ordens de Serviço',
    href: '/ordens-servico',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '17px',
          color: '#f5c518',
          letterSpacing: '-0.01em',
        }}>
          Risada Film
        </div>
        <div style={{
          fontSize: '10px',
          color: '#555',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginTop: '3px',
        }}>
          Área Administrativa
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              style={
                active
                  ? {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      background: 'rgba(245,197,24,0.1)',
                      borderLeft: '2px solid #f5c518',
                      color: '#f5c518',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      marginBottom: '2px',
                    }
                  : {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      borderLeft: '2px solid transparent',
                      color: '#666',
                      fontSize: '13px',
                      fontWeight: 400,
                      textDecoration: 'none',
                      marginBottom: '2px',
                      transition: 'color 0.15s, background 0.15s',
                    }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = '#f0f0f0';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = '#666';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sair */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => { signOut(); onClose(); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '9px 12px',
            borderRadius: '6px',
            borderLeft: '2px solid transparent',
            color: '#666',
            fontSize: '13px',
            fontWeight: 400,
            background: 'transparent',
            cursor: 'pointer',
            width: '100%',
            transition: 'color 0.15s, background 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#e53e3e';
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#666';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sair
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col" style={{
        width: '220px',
        minWidth: '220px',
        height: '100vh',
        background: 'rgba(255,255,255,0.03)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
        zIndex: 10,
      }}>
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      )}

      {/* Mobile drawer */}
      <aside className={`
        md:hidden fixed top-0 left-0 h-full w-[280px] z-50
        bg-[#111111] border-r border-[#222222]
        flex flex-col
        transform transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Close button */}
        <div className="flex justify-end px-4 pt-4">
          <button onClick={onClose} className="text-[#888888] cursor-pointer p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
