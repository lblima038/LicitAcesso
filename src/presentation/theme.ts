/**
 * presentation/theme.ts
 * Design tokens — paleta de cores e tipografia do LicitAcesso.
 */

// ─── Paleta de cores ──────────────────────────────────────────────────────────
export const colors = {
  primary: '#003d9b',
  primaryDark: '#002a6b',
  accent: '#0052cc',
  green: '#006c47',
  greenLight: '#8af5be',
  orange: '#ffdcc3',
  orangeDark: '#6a3600',
  background: '#f8f9fb',
  surface: '#ffffff',
  surfaceAlt: '#f3f4f6',
  border: '#e2e5ec',
  text: '#191c1e',
  textMuted: '#434654',
  danger: '#ba1a1a',
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const typography = {
  h1: { fontSize: 32, fontWeight: '800' as const, color: colors.primary },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  label: { fontSize: 12, fontWeight: '700' as const, color: colors.textMuted },
  tiny: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 1 },
};
