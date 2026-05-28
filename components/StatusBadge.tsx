import type { OrcamentoStatus, OSStatus } from '@/types';

const statusConfig: Record<string, { bg: string; text: string }> = {
  // Orçamento
  Pendente:       { bg: 'rgba(214,158,46,0.12)', text: '#d69e2e' },
  Aprovado:       { bg: 'rgba(56,161,105,0.12)', text: '#38a169' },
  Recusado:       { bg: 'rgba(229,62,62,0.12)',  text: '#e53e3e' },
  // OS
  Aberta:         { bg: 'rgba(136,136,136,0.12)', text: '#888888' },
  'Em Andamento': { bg: 'rgba(214,158,46,0.12)', text: '#d69e2e' },
  'Concluída':    { bg: 'rgba(56,161,105,0.12)', text: '#38a169' },
  Cancelada:      { bg: 'rgba(229,62,62,0.12)',  text: '#e53e3e' },
};

export default function StatusBadge({ status }: { status: OrcamentoStatus | OSStatus }) {
  const config = statusConfig[status] || statusConfig.Pendente;

  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide"
      style={{ background: config.bg, color: config.text }}
    >
      {status}
    </span>
  );
}
