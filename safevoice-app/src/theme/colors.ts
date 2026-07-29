// src/theme/colors.ts
// LankaVoice color system.
// Coral = primary brand / CTAs. Teal = navigation / structure / trust.
// Amber = trending only. Green/Red = vote sentiment only. Blue = links/info/anonymous tag.
// Keeping these meanings fixed (not reused for anything else) is deliberate —
// users scan a discussion feed fast, so color must always mean the same thing.

export const colors = {
  // Primary - coral/terracotta. Used for primary buttons, active states, brand mark.
  primary50: "#FAECE7",
  primary100: "#F5C4B3",
  primary200: "#F0997B",
  primary400: "#D85A30",
  primary600: "#993C1D",
  primary800: "#712B13",
  primary900: "#4A1B0C",

  // Structure - teal. Used for headers, tab bar active icon, links inside dark surfaces.
  teal50: "#E1F5EE",
  teal100: "#9FE1CB",
  teal200: "#5DCAA5",
  teal400: "#1D9E75",
  teal600: "#0F6E56",
  teal800: "#085041",
  teal900: "#04342C",

  // Trending - amber. Reserved exclusively for the "trending" badge/flame icon.
  amber50: "#FAEEDA",
  amber100: "#FAC775",
  amber200: "#EF9F27",
  amber400: "#BA7517",
  amber600: "#854F0B",

  // Vote sentiment - green (agree/like)
  green50: "#EAF3DE",
  green100: "#C0DD97",
  green400: "#639922",
  green600: "#3B6D11",

  // Vote sentiment - red (disagree/dislike)
  red50: "#FCEBEB",
  red100: "#F7C1C1",
  red400: "#E24B4A",
  red600: "#A32D2D",

  // Info / links / anonymous tag - blue
  blue50: "#E6F1FB",
  blue100: "#B5D4F4",
  blue400: "#378ADD",
  blue600: "#185FA5",

  // Neutrals
  gray50: "#F1EFE8",
  gray100: "#D3D1C7",
  gray200: "#B4B2A9",
  gray400: "#888780",
  gray600: "#5F5E5A",
  gray800: "#444441",
  gray900: "#2C2C2A",

  white: "#FFFFFF",
  black: "#000000",
} as const;

// Semantic tokens — screens should import these, not raw colors above,
// so a future theme/dark-mode pass only touches this block.
export const lightTheme = {
  backgroundPrimary: colors.white,
  backgroundSecondary: colors.gray50,
  backgroundTertiary: "#EDEAE0",

  textPrimary: colors.gray900,
  textSecondary: colors.gray600,
  textTertiary: colors.gray400,
  textOnPrimary: colors.white,

  borderDefault: colors.gray100,
  borderStrong: colors.gray200,

  brandPrimary: colors.primary400,
  brandPrimaryDark: colors.primary600,
  brandPrimaryLight: colors.primary50,
  brandPrimaryText: colors.primary800,

  structure: colors.teal600,
  structureLight: colors.teal50,
  structureText: colors.teal800,

  trending: colors.amber200,
  trendingLight: colors.amber50,
  trendingText: colors.amber600,

  agree: colors.green400,
  agreeLight: colors.green50,
  agreeText: colors.green600,

  disagree: colors.red400,
  disagreeLight: colors.red50,
  disagreeText: colors.red600,

  info: colors.blue400,
  infoLight: colors.blue50,
  infoText: colors.blue600,

  anonymous: colors.blue400,
  anonymousLight: colors.blue50,
  anonymousText: colors.blue600,
} as const;

export type Theme = typeof lightTheme;
