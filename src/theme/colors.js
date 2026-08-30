// STAChat dark theme — "Secure. Fast. Yours."
// These are the canonical colors for the app going forward. Existing
// screens have had their hardcoded hex values remapped to match this
// palette; new screens should import from here instead of hardcoding
// hex values again.

export const COLORS = {
  bg: "#0D1117",          // main app background
  surface: "#12181C",     // cards, list items, headers, "other" bubbles
  surfaceAlt: "#1C2128",  // inputs, subtle dividers-as-background
  border: "#21262D",      // hairline borders/dividers

  bubbleMine: "#0B4F46",  // sent message bubble
  bubbleOther: "#1C2128", // received message bubble

  primary: "#00BFA5",     // teal — links, secondary buttons, icons
  accent: "#00E676",      // bright green — primary buttons, active states, "STA" wordmark

  textPrimary: "#E6F7F3", // main text on dark backgrounds
  textMuted: "#9BA3AE",   // secondary/timestamp/placeholder text

  danger: "#D32F2F",
  warning: "#FFA000",
};

export default COLORS;
