import { useTheme } from "../contexts/ThemeContext";

export function useThemeColors() {
  const { theme } = useTheme();

  return {
    theme,
    bgBase: 'var(--bg-base)',
    bgSurface: 'var(--bg-surface)',
    primaryAction: 'var(--color-primary-action)',
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    textMuted: 'var(--text-muted)',
    border: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    destructive: theme === 'dark' ? '#E61445' : '#dc2626',
    primaryForeground: theme === 'dark' ? '#e8e8e8' : '#ffffff',
  };
}
