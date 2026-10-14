import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Risada Film | Balcão & Orçamentos',
  description: 'Sistema Express de Balcão e Vistorias - Risada Film',
  manifest: '/manifest-balcao.json',
  icons: {
    icon: '/images/LogoNovoRisadaLimpo.png',
    apple: '/images/LogoNovoRisadaLimpo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Risada Balcão',
  },
};

export const viewport: Viewport = {
  themeColor: '#f5c518',
  width: 'device-width',
  initialScale: 1,
};

export default function BalcaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#111111] print:bg-white text-neutral-100">
      {children}
    </div>
  );
}
