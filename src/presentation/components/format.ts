/**
 * presentation/components/format.ts
 * Helpers de formatação reutilizáveis.
 */

// Formata valores monetários abreviados: R$ 1.2B, R$ 1.2M, R$ 450K…
export function formatBRL(value: number): string {
  if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
