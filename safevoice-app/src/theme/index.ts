// src/theme/index.ts
import { colors, lightTheme } from './colors';
import { fontFamily, fontSize, lineHeight, fontWeight } from './typography';
import { spacing, radius } from './spacing';

export const theme = {
  colors,
  ...lightTheme,
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  spacing,
  radius,
};

export type AppTheme = typeof theme;

export * from './colors';
export * from './typography';
export * from './spacing';
