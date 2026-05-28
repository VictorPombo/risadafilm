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
 * Formata Date ou string ISO para DD/MM/AAAA
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00') : date;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
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
export function formatDecimal(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
