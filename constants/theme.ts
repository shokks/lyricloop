import { Platform } from 'react-native';

/** Returns a CSS rgba() string from a 6-digit hex color and an opacity 0–1. */
export function withOpacity(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const Palette = {
  background: '#0C0C0E',
  surface: '#161618',
  surfaceRaised: '#222224',
  border: '#2C2C30',
  textPrimary: '#F2F2F0',
  textSecondary: '#8A8A90',
  textDisabled: '#484850',
  accent: '#9B8EC4',
  accentMuted: '#1E1828',
  recordRed: '#C0392B',
  recordActive: '#E74C3C',
} as const;

export const Colors = {
  light: {
    text: Palette.textPrimary,
    background: Palette.background,
    tint: Palette.accent,
    icon: Palette.textSecondary,
    tabIconDefault: Palette.textSecondary,
    tabIconSelected: Palette.accent,
  },
  dark: {
    text: Palette.textPrimary,
    background: Palette.background,
    tint: Palette.accent,
    icon: Palette.textSecondary,
    tabIconDefault: Palette.textSecondary,
    tabIconSelected: Palette.accent,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
