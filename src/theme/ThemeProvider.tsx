import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ThemeMode } from '@/constants/app';
import { tokens, ACCENT_COLORS, BACKGROUND_STYLES, type AccentColorId, type BackgroundStyleId } from '@/theme/tokens';

type ResolvedTheme = 'dark' | 'light';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  accentColor: AccentColorId;
  backgroundStyle: BackgroundStyleId;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return mode;
}

function strengthen(rgba: string, multiplier: number): string {
  const match = rgba.match(/rgba?\(([^)]+)\)/);
  if (!match) return rgba;
  const parts = match[1].split(',').map((p) => p.trim());
  if (parts.length < 4) return rgba;
  const alpha = Math.min(1, parseFloat(parts[3]) * multiplier);
  return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha.toFixed(3)})`;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  mode: ThemeMode;
  accentColor: AccentColorId;
  backgroundStyle: BackgroundStyleId;
  reducedMotion?: boolean;
}

export function ThemeProvider({
  children,
  mode,
  accentColor,
  backgroundStyle,
  reducedMotion = false,
}: ThemeProviderProps) {
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(mode));

  useEffect(() => {
    setResolvedTheme(resolveTheme(mode));
    if (mode !== 'system' || typeof window === 'undefined') return;

    const media = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (event: MediaQueryListEvent) => setResolvedTheme(event.matches ? 'light' : 'dark');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [mode]);

  useEffect(() => {
    const palette = tokens.colors[resolvedTheme];
    const accent = ACCENT_COLORS.find((color) => color.id === accentColor) ?? ACCENT_COLORS[0];
    const background = BACKGROUND_STYLES.find((style) => style.id === backgroundStyle) ?? BACKGROUND_STYLES[0];
    const root = document.documentElement;

    root.style.setProperty('--app-bg', palette.background);
    root.style.setProperty('--app-bg-muted', palette.backgroundMuted);
    root.style.setProperty('--app-surface', palette.surface);
    root.style.setProperty('--app-surface-strong', palette.surfaceStrong);
    root.style.setProperty('--app-elevated', palette.elevated);
    root.style.setProperty('--app-border', palette.border);
    root.style.setProperty('--app-border-strong', palette.borderStrong);
    root.style.setProperty('--app-text', palette.text);
    root.style.setProperty('--app-text-muted', palette.textMuted);
    root.style.setProperty('--app-text-subtle', palette.textSubtle);

    root.style.setProperty('--accent', accent.primary);
    root.style.setProperty('--accent-light', accent.light);
    root.style.setProperty('--accent-soft', accent.soft);
    root.style.setProperty('--accent-glow', accent.glow);
    root.style.setProperty('--accent-strong', strengthen(accent.soft, 3));

    root.style.setProperty('--app-bg-image', background[resolvedTheme]);
    root.dataset.theme = resolvedTheme;
    root.dataset.accent = accentColor;
    root.dataset.background = backgroundStyle;
    root.dataset.reduceMotion = reducedMotion ? 'true' : 'false';
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme, accentColor, backgroundStyle, reducedMotion]);

  const value = useMemo(
    () => ({ mode, resolvedTheme, accentColor, backgroundStyle }),
    [mode, resolvedTheme, accentColor, backgroundStyle],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return context;
}
