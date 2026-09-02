/**
 * Design tokens extracted from Figma screenshot color sampling.
 * If your Figma file specifies different values in Dev Mode, update here.
 */
export const designTokens = {
  colors: {
    red: "#C80F2F",
    redDark: "#BA162F",
    redLight: "#FEE8EA",
    page: "#F9FAFC",
    border: "#EDEDED",
    text: "#1F2937",
    textMuted: "#6B7280",
    greenBg: "#ECFDF3",
    greenText: "#067647",
  },
  font: {
    family: "Inter",
    weights: [400, 500, 600, 700] as const,
  },
} as const;
