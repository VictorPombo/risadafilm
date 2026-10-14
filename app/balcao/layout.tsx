import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Risada Film | Balcão & Orçamentos',
  description: 'Sistema Express de Balcão e Vistorias - Risada Film',
  manifest: '/manifest-balcao.json',
  icons: {
    icon: [
      { url: '/images/logo-balcao-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/LogoNovoRisadaLimpo.png' },
    ],
    apple: [
      { url: '/images/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/images/LogoNovoRisadaLimpo.png' },
    ],
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
    <div className="min-h-screen w-full max-w-[100vw] print:max-w-none overflow-x-hidden print:overflow-visible bg-neutral-100 text-neutral-900 flex flex-col">
      {children}
    </div>
  );
}

