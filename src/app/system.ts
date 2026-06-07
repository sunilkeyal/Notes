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
    ".ProseMirror": {
      fontSize: "sm",
    },
    ".ProseMirror h1": {
      fontSize: "xl",
      fontWeight: "bold",
      letterSpacing: "tight",
      marginTop: "1em",
      marginBottom: "0.3em",
    },
    ".ProseMirror h2": {
      fontSize: "lg",
      fontWeight: "semibold",
      letterSpacing: "tight",
      marginTop: "0.8em",
      marginBottom: "0.25em",
    },
    ".ProseMirror h3": {
      fontSize: "md",
      fontWeight: "semibold",
      marginTop: "0.6em",
      marginBottom: "0.2em",
    },
    ".ProseMirror h1:first-child, .ProseMirror h2:first-child, .ProseMirror h3:first-child": {
      marginTop: 0,
    },
    ".ProseMirror p": {
      marginBottom: "0.35em",
      lineHeight: "1.45",
    },
    ".ProseMirror ul": {
      listStyle: "disc",
      paddingLeft: "1.5em",
      marginTop: "0.4em",
      marginBottom: "0.4em",
    },
    ".ProseMirror ol": {
      listStyle: "decimal",
      paddingLeft: "1.5em",
      marginTop: "0.4em",
      marginBottom: "0.4em",
    },
    ".ProseMirror li": {
      marginTop: "0.1em",
      marginBottom: "0.1em",
    },
    ".ProseMirror li p": {
      margin: 0,
    },
    ".ProseMirror blockquote": {
      borderLeft: "3px solid",
      borderColor: "accent",
      paddingLeft: "1em",
      marginTop: "0.6em",
      marginBottom: "0.6em",
      color: "fg.subtle",
      fontStyle: "italic",
    },
    ".ProseMirror code": {
      bg: "bg.muted",
      borderRadius: "sm",
      paddingX: "0.3em",
      paddingY: "0.1em",
      fontSize: "0.85em",
      fontFamily: "var(--font-mono), monospace",
      color: "fg",
    },
    ".ProseMirror pre": {
      bg: "bg.subtle",
      border: "1px solid",
      borderColor: "border",
      borderRadius: "md",
      padding: "1em",
      marginTop: "0.6em",
      marginBottom: "0.6em",
      overflowX: "auto",
      fontFamily: "var(--font-mono), monospace",
      fontSize: "0.875rem",
      lineHeight: "1.6",
    },
    ".ProseMirror pre code": {
      bg: "transparent",
      padding: 0,
      borderRadius: 0,
      color: "inherit",
      fontSize: "inherit",
    },
    ".ProseMirror hr": {
      border: "none",
      borderTop: "1px solid",
      borderColor: "border",
      marginTop: "1em",
      marginBottom: "1em",
    },
    ".ProseMirror a": {
      color: "accent",
      textDecoration: "underline",
      textUnderlineOffset: "2px",
    },
    ".ProseMirror s": {
      textDecoration: "line-through",
      color: "fg.muted",
    },
    ".ProseMirror img": {
      maxWidth: "100%",
      height: "auto",
    },
    ".ProseMirror em": {
      fontStyle: "italic",
    },
  },
});

export const system = createSystem(defaultConfig, config);
