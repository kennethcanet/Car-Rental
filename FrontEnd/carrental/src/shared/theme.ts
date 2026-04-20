// DriveEasy Design Tokens
// Single source of truth for all visual constants in the app.

export const colors = {
  // Brand
  primary: "#185FA5",
  primaryLight: "#378ADD",
  primaryLighter: "#B5D4F4",
  primaryBg: "#E6F1FB",

  // Semantic
  success: "#3B6D11",
  successBg: "#EAF3DE",
  danger: "#A32D2D",
  dangerBg: "#FCEBEB",

  // Surfaces
  surface: "#FFFFFF",
  pageBg: "#F3F4F6",

  // Text
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",

  // Borders
  borderDefault: "#E5E7EB",
  borderEmphasis: "#D1D5DB",
} as const;

export const radius = {
  sm: 8,
  md: 12,
  pill: 100,
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  cardPad: 14,
  panelPad: 24,
} as const;

export const fontSize = {
  screenTitle: 20,
  sectionHeading: 17,
  body: 14,
  label: 12,
  micro: 11,
} as const;
