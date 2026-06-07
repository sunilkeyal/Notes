import { createSystem, defineConfig, defaultConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: { value: { base: "#f8f9fb", _dark: "#12141d" } },
          subtle: { value: { base: "#eef0f4", _dark: "#1a1c28" } },
          muted: { value: { base: "#e3e6ec", _dark: "#222438" } },
          emphasized: { value: { base: "#d5dae2", _dark: "#2d3048" } },
          surface: { value: { base: "#ffffff", _dark: "#12141d" } },
          header: { value: { base: "#f8f9fb", _dark: "#12141d" } },
        },
        fg: {
          DEFAULT: { value: { base: "#1f2937", _dark: "#e2e7ee" } },
          muted: { value: { base: "#9ca3af", _dark: "#5a5d72" } },
          subtle: { value: { base: "#6b7280", _dark: "#888ba0" } },
        },
        accent: {
          DEFAULT: { value: { base: "#3b82f6", _dark: "#5b8def" } },
          hover: { value: { base: "#2563eb", _dark: "#7ba4f5" } },
        },
        border: {
          DEFAULT: { value: { base: "#dde0e6", _dark: "#262838" } },
          subtle: { value: { base: "#e5e7eb", _dark: "#262838" } },
        },
        danger: {
          DEFAULT: { value: { base: "#ef4444", _dark: "#f87171" } },
          hover: { value: { base: "#dc2626", _dark: "#ef4444" } },
        },
        overlay: { value: { base: "rgba(0, 0, 0, 0.3)", _dark: "rgba(0, 0, 0, 0.5)" } },
        highlight: { value: { base: "#fef3c7", _dark: "rgba(251, 191, 36, 0.2)" } },
        toolbar: {
          bg: { value: { base: "#fcfcfd", _dark: "#181a25" } },
        },
        editor: {
          bg: { value: { base: "#ffffff", _dark: "#12141d" } },
        },
      },
    },
  },
  globalCss: {
    "html, body": {
      height: "100%",
      overflow: "hidden",
      bg: "bg",
      color: "fg",
      fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
    },
  },
});

export const system = createSystem(defaultConfig, config);
