export const tokens = {
  radius: {
    xs: 12,
    sm: 18,
    md: 24,
    lg: 32,
    xl: 40,
    pill: 999,
  },
  space: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  shadow: {
    glow: '0 24px 80px rgba(15, 23, 42, 0.45)',
    card: '0 16px 38px rgba(2, 8, 23, 0.28), 0 2px 6px rgba(2, 8, 23, 0.18)',
    cardHover: '0 28px 56px rgba(2, 8, 23, 0.42), 0 4px 10px rgba(2, 8, 23, 0.24)',
    soft: '0 10px 30px rgba(2, 8, 23, 0.18)',
    ring: '0 0 0 1px rgba(255, 255, 255, 0.06) inset',
  },
  motion: {
    easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
    easeSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    easeSmooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    duration: {
      fast: 0.18,
      base: 0.28,
      slow: 0.45,
    },
  },
  colors: {
    dark: {
      background: '#07111f',
      backgroundMuted: '#0d1a2b',
      surface: 'rgba(9, 18, 32, 0.74)',
      surfaceStrong: 'rgba(13, 26, 43, 0.92)',
      elevated: 'rgba(15, 23, 42, 0.92)',
      border: 'rgba(255, 255, 255, 0.08)',
      borderStrong: 'rgba(255, 255, 255, 0.14)',
      text: '#f8fafc',
      textMuted: '#cbd5e1',
      textSubtle: 'rgba(203, 213, 225, 0.62)',
      // Floating chip / banner surface — dense, blurred glass over the page background.
      chipBg: 'rgba(7, 17, 31, 0.78)',
      chipBgStrong: 'rgba(7, 17, 31, 0.9)',
      chipShadow: '0 18px 38px rgba(2, 8, 23, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      // Modal backdrop — used by OverlayFrame, ConfirmDrawer, CommandPalette.
      overlayScrim: 'rgba(2, 6, 23, 0.78)',
    },
    light: {
      background: '#f7f5ef',
      backgroundMuted: '#fffdf7',
      surface: 'rgba(255, 255, 255, 0.84)',
      surfaceStrong: 'rgba(255, 255, 255, 0.95)',
      elevated: 'rgba(255, 255, 255, 0.96)',
      border: 'rgba(15, 23, 42, 0.08)',
      borderStrong: 'rgba(15, 23, 42, 0.16)',
      text: '#0f172a',
      textMuted: '#475569',
      textSubtle: 'rgba(71, 85, 105, 0.62)',
      // Light mode chips: nearly-opaque cream with a subtle warm border.
      chipBg: 'rgba(255, 253, 247, 0.88)',
      chipBgStrong: 'rgba(255, 253, 247, 0.96)',
      chipShadow: '0 18px 38px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      // Light mode overlay scrim sits on a cream page; keep it warm-tinted.
      overlayScrim: 'rgba(15, 23, 42, 0.42)',
    },
  },
} as const;

export const ACCENT_COLORS = [
  {
    id: 'sunset',
    label: 'Sunset',
    primary: '#f97316',
    light: '#fdba74',
    soft: 'rgba(249, 115, 22, 0.18)',
    glow: 'rgba(249, 115, 22, 0.35)',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    primary: '#38bdf8',
    light: '#7dd3fc',
    soft: 'rgba(56, 189, 248, 0.18)',
    glow: 'rgba(56, 189, 248, 0.35)',
  },
  {
    id: 'rose',
    label: 'Rose',
    primary: '#f472b6',
    light: '#f9a8d4',
    soft: 'rgba(244, 114, 182, 0.18)',
    glow: 'rgba(244, 114, 182, 0.35)',
  },
  {
    id: 'forest',
    label: 'Forest',
    primary: '#10b981',
    light: '#6ee7b7',
    soft: 'rgba(16, 185, 129, 0.18)',
    glow: 'rgba(16, 185, 129, 0.35)',
  },
  {
    id: 'lavender',
    label: 'Lavender',
    primary: '#a78bfa',
    light: '#c4b5fd',
    soft: 'rgba(167, 139, 250, 0.18)',
    glow: 'rgba(167, 139, 250, 0.35)',
  },
  {
    id: 'gold',
    label: 'Gold',
    primary: '#facc15',
    light: '#fde68a',
    soft: 'rgba(250, 204, 21, 0.18)',
    glow: 'rgba(250, 204, 21, 0.35)',
  },
  {
    id: 'crimson',
    label: 'Crimson',
    primary: '#ef4444',
    light: '#fca5a5',
    soft: 'rgba(239, 68, 68, 0.18)',
    glow: 'rgba(239, 68, 68, 0.35)',
  },
  {
    id: 'mint',
    label: 'Mint',
    primary: '#22d3ee',
    light: '#67e8f9',
    soft: 'rgba(34, 211, 238, 0.18)',
    glow: 'rgba(34, 211, 238, 0.35)',
  },
] as const;

export type AccentColorId = (typeof ACCENT_COLORS)[number]['id'];

export const BACKGROUND_STYLES = [
  {
    id: 'aurora',
    label: 'Aurora',
    dark:
      'radial-gradient(circle at 20% 0%, rgba(56,189,248,0.18), transparent 32%), radial-gradient(circle at 80% 10%, rgba(244,114,182,0.16), transparent 28%), radial-gradient(circle at 50% 100%, rgba(249,115,22,0.14), transparent 36%), #06101d',
    light:
      'radial-gradient(circle at 20% 0%, rgba(56,189,248,0.22), transparent 36%), radial-gradient(circle at 80% 10%, rgba(244,114,182,0.18), transparent 30%), radial-gradient(circle at 50% 100%, rgba(249,115,22,0.16), transparent 40%), #f7f5ef',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    dark:
      'radial-gradient(circle at 30% 10%, rgba(99,102,241,0.22), transparent 40%), radial-gradient(circle at 70% 90%, rgba(14,116,144,0.18), transparent 38%), #050816',
    light:
      'radial-gradient(circle at 30% 10%, rgba(99,102,241,0.16), transparent 42%), radial-gradient(circle at 70% 90%, rgba(14,116,144,0.12), transparent 38%), #eef2ff',
  },
  {
    id: 'sahara',
    label: 'Sahara',
    dark:
      'radial-gradient(circle at 0% 0%, rgba(251,146,60,0.22), transparent 38%), radial-gradient(circle at 100% 0%, rgba(239,68,68,0.16), transparent 32%), radial-gradient(circle at 50% 100%, rgba(180,83,9,0.18), transparent 40%), #1c0f08',
    light:
      'radial-gradient(circle at 0% 0%, rgba(251,146,60,0.22), transparent 38%), radial-gradient(circle at 100% 0%, rgba(239,68,68,0.14), transparent 32%), #fdf6e8',
  },
  {
    id: 'forest',
    label: 'Forest',
    dark:
      'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.2), transparent 38%), radial-gradient(circle at 80% 80%, rgba(45,212,191,0.16), transparent 36%), #051410',
    light:
      'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.16), transparent 40%), radial-gradient(circle at 80% 80%, rgba(45,212,191,0.12), transparent 36%), #ecfdf5',
  },
  {
    id: 'rose',
    label: 'Rose',
    dark:
      'radial-gradient(circle at 30% 0%, rgba(244,114,182,0.22), transparent 38%), radial-gradient(circle at 70% 100%, rgba(168,85,247,0.18), transparent 38%), #160611',
    light:
      'radial-gradient(circle at 30% 0%, rgba(244,114,182,0.18), transparent 40%), radial-gradient(circle at 70% 100%, rgba(168,85,247,0.14), transparent 38%), #fdf2f8',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    dark: '#07111f',
    light: '#f7f5ef',
  },
] as const;

export type BackgroundStyleId = (typeof BACKGROUND_STYLES)[number]['id'];
