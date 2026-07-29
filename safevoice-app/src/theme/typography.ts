// src/theme/typography.ts
// Font stack includes Sinhala fallback (Noto Sans Sinhala) so mixed
// English/Sinhala strings render correctly without a second component.
// Platform default fonts (San Francisco / Roboto) already fall back to
// system Sinhala glyphs on most devices, but we declare it explicitly
// for any custom font loading via expo-font later.

import { Platform } from "react-native";

export const fontFamily = {
  regular: Platform.select({
    ios: "System",
    android: "sans-serif",
    default: "System",
  }),
  medium: Platform.select({
    ios: "System",
    android: "sans-serif-medium",
    default: "System",
  }),
  // When custom fonts are loaded via expo-font, swap these for:
  // 'NotoSansSinhala-Regular' / 'NotoSansSinhala-Medium'
  sinhalaRegular: "NotoSansSinhala-Regular",
  sinhalaMedium: "NotoSansSinhala-Medium",
};

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
};

export const lineHeight = {
  tight: 1.2,
  normal: 1.45,
  // Sinhala script needs more vertical room than Latin for combining vowel
  // marks above/below the baseline — bump line-height ~15% for Sinhala text.
  sinhala: 1.65,
};

export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};
