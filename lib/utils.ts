/**
 * Formata número para moeda brasileira (R$ 1.234,56)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata Date ou string ISO para DD/MM/AAAA (suporta YYYY-MM-DD, ISO timestamp, DD/MM/AAAA e texto livre)
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  const trimmed = date.trim();
  if (!trimmed) return '';
  if (/^\d{2}\/\d{2}\/\d{2,4}/.test(trimmed)) return trimmed;
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${d}/${m}/${y}`;
  }
  return trimmed;
}

/**
 * Converte data para formato ISO YYYY-MM-DD aceito pelo Postgres
 */
export function toDbDate(val?: string | null): string | null {
  if (!val || !val.trim()) return null;
  const trimmed = val.trim();
  const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    const [, d, m, y] = brMatch;
    return `${y}-${m}-${d}`;
  }
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return isoMatch[0];
  }
  return trimmed;
}

/**
 * Retorna data de hoje no formato DD/MM/AAAA
 */
export function todayBR(): string {
  return formatDate(new Date());
}

/**
 * Converte input com vírgula para número: "1.234,56" → 1234.56
 */
export function parseDecimal(value: string): number {
  const cleaned = value.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Formata número para exibição com vírgula: 1234.56 → "1.234,56"
 */
export function formatDecimal(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * Retorna data de hoje no formato YYYY-MM-DD (para inputs date)
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Gera classes CSS condicionais
 */
export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
