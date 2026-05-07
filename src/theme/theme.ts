export const APP_THEME = {
  brandName: 'Lunerie',
  tagline: 'Find your moonlight',
  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
  colors: {
    bodyBackground: '#0A0A1A',
    frameBackground: '#FFFFFF',
    secondary: '#14B8A6',
    accent: '#F59E0B',
    accentLight: '#FCD34D',
    success: '#10B981',
    pass: '#6B7280',
    warning: '#F97316',
    danger: '#F87171',
    violet: '#8B5CF6',
    surface: '#F0FDFA',
    darkSurface: '#374151',
    night: '#1E1B2E',
    white: '#FFFFFF',
    black: '#000000',
  },
  themes: {
    teal: {
      primary: '#0D9488',
      dark: '#0F766E',
      light: '#5EEAD4',
      deep: '#065F56',
      gradient: 'linear-gradient(135deg, #0D9488 0%, #065F56 100%)',
    },
    indigo: {
      primary: '#6366F1',
      dark: '#4F46E5',
      light: '#A5B4FC',
      deep: '#4338CA',
      gradient: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
    },
    rose: {
      primary: '#F43F5E',
      dark: '#E11D48',
      light: '#FDA4AF',
      deep: '#BE123C',
      gradient: 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
    },
    amber: {
      primary: '#F59E0B',
      dark: '#D97706',
      light: '#FCD34D',
      deep: '#B45309',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
    },
    emerald: {
      primary: '#10B981',
      dark: '#059669',
      light: '#6EE7B7',
      deep: '#047857',
      gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
    },
    violet: {
      primary: '#8B5CF6',
      dark: '#7C3AED',
      light: '#C4B5FD',
      deep: '#6D28D9',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    },
  },
} as const;

export type ColorTheme = keyof typeof APP_THEME.themes;

export const SWIPE_FEEDBACK_STYLES = {
  yes: {
    glowBoxShadow: '0 0 40px rgba(16, 185, 129, 0.6), inset 0 0 40px rgba(16, 185, 129, 0.15)',
    glowBorder: '3px solid rgba(16, 185, 129, 0.8)',
  },
  pass: {
    glowBoxShadow: '0 0 40px rgba(107, 114, 128, 0.5), inset 0 0 40px rgba(107, 114, 128, 0.1)',
    glowBorder: '3px solid rgba(107, 114, 128, 0.7)',
  },
  spark: {
    glowBoxShadow: '0 0 40px rgba(245, 158, 11, 0.6), inset 0 0 40px rgba(245, 158, 11, 0.15)',
    glowBorder: '3px solid rgba(245, 158, 11, 0.8)',
  },
} as const;

export const GRADIENTS = {
  brandText: 'linear-gradient(to right, var(--color-primary), var(--color-primary-light))',
  splashBackground: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-deep) 60%, #0A2F2A 100%)',
  premium: 'linear-gradient(135deg, var(--color-accent), var(--color-warning))',
} as const;

export const SURFACE_STYLES = {
  splashOrbBackground: 'rgba(255,255,255,0.15)',
  splashOrbBackdropFilter: 'blur(10px)',
} as const;

export const CHAT_BACKGROUNDS = [
  { id: 'default', color: '#FFFFFF', label: 'Standard' },
  { id: 'warm', color: '#FFF7ED', label: 'Warm' },
  { id: 'cool', color: '#F0F9FF', label: 'Cool' },
  { id: 'night', color: '#1E1B2E', label: 'Night' },
  { id: 'forest', color: '#F0FDF4', label: 'Forest' },
  { id: 'rose', color: '#FFF1F2', label: 'Rose' },
] as const;
export type ChatBackgroundId = (typeof CHAT_BACKGROUNDS)[number]['id'];

export const CHAT_BUBBLE_COLORS = [
  { id: 'theme', color: 'var(--color-primary)', label: 'Theme' },
  { id: 'blue', color: '#3B82F6', label: 'Blue' },
  { id: 'purple', color: '#8B5CF6', label: 'Purple' },
  { id: 'pink', color: '#EC4899', label: 'Pink' },
  { id: 'green', color: '#10B981', label: 'Green' },
  { id: 'orange', color: '#F97316', label: 'Orange' },
] as const;
export type ChatBubbleColorId = (typeof CHAT_BUBBLE_COLORS)[number]['id'];
