/**
 * Seller University design tokens — the single source of truth (wireframes S4).
 *
 * Guardrail: components under src/components/university must derive every
 * color, radius, and shadow from these tokens (via university.css variables).
 * Raw Tailwind palette classes are banned in that directory.
 */

export const uniTokens = {
  color: {
    ink: '#17181C',
    paper: '#FCFBF7',
    line: '#E7E5DE',
    muted: '#75726A',
    yellow: '#F6C42D',
    yellowSoft: '#FCEFC7',
    cream1: '#FFFBEE',
    cream2: '#FBEFC9',
    red: '#E14B32',
    redSoft: '#FDE8E3',
    green: '#1F8A4C',
    greenSoft: '#E4F6E9',
    blue: '#2F6FB6',
    blueSoft: '#E8F0FA',
    violet: '#6D4FA3',
    violetSoft: '#F1EAFB',
  },
  /** The FleekOS signature: hard offset, never blurred. */
  shadow: { hard: '2px 2px 0 #17181C' },
  radius: { chip: 999, card: 14, tag: '4px 12px 12px 4px' },
  font: {
    display: `Poppins, Nunito, 'Avenir Next', 'Trebuchet MS', 'Segoe UI', system-ui, sans-serif`,
  },
} as const;

export type UniTokens = typeof uniTokens;
