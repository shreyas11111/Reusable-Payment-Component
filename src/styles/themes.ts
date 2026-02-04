import type { ThemeConfig, ThemeName } from '../types';

const defaultTheme: ThemeConfig = {
  primaryColor: '#5469d4',
  errorColor: '#df1b41',
  successColor: '#30b566',
  backgroundColor: '#ffffff',
  textColor: '#30313d',
  borderColor: '#e6e6e6',
  placeholderColor: '#aab7c4',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontSize: '16px',
  lineHeight: '1.5',
  padding: '12px',
  borderRadius: '6px',
  gap: '12px',
  focusRing: '0 0 0 3px rgba(84, 105, 212, 0.25)'
};

const minimalTheme: ThemeConfig = {
  ...defaultTheme,
  borderColor: '#d1d5db',
  borderRadius: '4px',
  focusRing: '0 0 0 2px rgba(0, 0, 0, 0.1)'
};

const darkTheme: ThemeConfig = {
  ...defaultTheme,
  primaryColor: '#7c9cff',
  backgroundColor: '#1a1a1a',
  textColor: '#e5e5e5',
  borderColor: '#404040',
  placeholderColor: '#737373',
  focusRing: '0 0 0 3px rgba(124, 156, 255, 0.35)'
};

const themeMap: Record<ThemeName, ThemeConfig> = {
  default: defaultTheme,
  minimal: minimalTheme,
  dark: darkTheme
};

export function getTheme(name: ThemeName | ThemeConfig): ThemeConfig {
  if (typeof name === 'object' && name !== null) return { ...defaultTheme, ...name };
  return themeMap[name as ThemeName] ?? defaultTheme;
}

export function themeToCssVars(theme: ThemeConfig): string {
  return `
  --payment-primary-color: ${theme.primaryColor ?? defaultTheme.primaryColor};
  --payment-error-color: ${theme.errorColor ?? defaultTheme.errorColor};
  --payment-success-color: ${theme.successColor ?? defaultTheme.successColor};
  --payment-background: ${theme.backgroundColor ?? defaultTheme.backgroundColor};
  --payment-text-color: ${theme.textColor ?? defaultTheme.textColor};
  --payment-border-color: ${theme.borderColor ?? defaultTheme.borderColor};
  --payment-placeholder-color: ${theme.placeholderColor ?? defaultTheme.placeholderColor};
  --payment-font-family: ${theme.fontFamily ?? defaultTheme.fontFamily};
  --payment-font-size: ${theme.fontSize ?? defaultTheme.fontSize};
  --payment-line-height: ${theme.lineHeight ?? defaultTheme.lineHeight};
  --payment-padding: ${theme.padding ?? defaultTheme.padding};
  --payment-border-radius: ${theme.borderRadius ?? defaultTheme.borderRadius};
  --payment-gap: ${theme.gap ?? defaultTheme.gap};
  --payment-focus-ring: ${theme.focusRing ?? defaultTheme.focusRing};
  `;
}
