import { createContext, useContext, useEffect, useMemo } from 'react';
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
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return mode;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  mode: ThemeMode;
  accentColor: AccentColorId;
  backgroundStyle: BackgroundStyleId;
  reducedMotion?: boolean;
}

export function ThemeProvider({ children, mode, accentColor, backgroundStyle, reducedMotion = false }: ThemeProviderProps) {
  const resolvedTheme = resolveTheme(mode);

  useEffect(() => {
    const palette = tokens.colors[resolvedTheme];
    const accent = ACCENT_COLORS.find((color) => color.id === accentColor) ?? ACCENT_COLORS[0];
    const background = BACKGROUND_STYLES.find((style) => style.id === backgroundStyle) ?? BACKGROUND_STYLES[0];
    const root = document.documentElement;

    root.style.setProperty('--app-bg', palette.background);
    root.style.setProperty('--app-bg-muted', palette.backgroundMuted);
    root.style.setProperty('--app-surface', palette.surface);
    root.style.setProperty('--app-elevated', palette.elevated);
    root.style.setProperty('--app-border', palette.border);
    root.style.setProperty('--app-text', palette.text);
    root.style.setProperty('--app-text-muted', palette.textMuted);

    root.style.setProperty('--accent', accent.primary);
    root.style.setProperty('--accent-light', accent.light);
    root.style.setProperty('--accent-soft', accent.soft);
    root.style.setProperty('--accent-glow', accent.glow);

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
