"use client";

import { type Editor } from "@tiptap/react";
import { Box, Flex, IconButton, Spacer, NativeSelectField, NativeSelectRoot } from "@chakra-ui/react";

interface EditorToolbarProps {
  editor: Editor | null;
}

interface ToolBtnProps {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}

interface SelectProps {
  value: string | number;
  onChange: (val: string) => void;
  options: { label: string; value: string | number }[];
}

function ToolBtn({ onClick, isActive, title, children }: ToolBtnProps) {
  return (
    <IconButton
      size="xs"
      variant="ghost"
      aria-label={title}
      title={title}
      onClick={onClick}
      css={{
        color: isActive ? "accent" : "fg.subtle",
        bg: isActive ? "bg.emphasized" : "transparent",
        _hover: {
          bg: "bg.muted",
          color: isActive ? "accent" : "fg",
        },
      }}
    >
      {children}
    </IconButton>
  );
}

function Select({ value, onChange, options }: SelectProps) {
  return (
    <NativeSelectRoot
      size="xs"
      variant="plain"
      css={{
        bg: "transparent",
        borderRadius: "0.375rem",
        _hover: { bg: "bg.muted" },
      }}
    >
      <NativeSelectField
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        css={{
          color: "fg.subtle",
          fontSize: "0.75rem",
          fontWeight: "500",
        }}
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </NativeSelectField>
    </NativeSelectRoot>
  );
}

function ToolbarDivider() {
  return (
    <Box
      css={{
        width: "1px",
        height: "1rem",
        bg: "border.subtle",
        flexShrink: 0,
      }}
    />
  );
}

const HEADING_SIZES = [
  { label: "Normal", value: 0 },
  { label: "H1", value: 1 },
  { label: "H2", value: 2 },
  { label: "H3", value: 3 },
];

const FONT_FAMILIES = [
  { label: "Default", value: "var(--font-geist-sans), sans-serif" },
  { label: "Serif", value: "Georgia, Cambria, 'Times New Roman', Times, serif" },
  { label: "Mono", value: "'JetBrains Mono', 'Fira Code', monospace" },
];

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <>
      <Flex
        gap="0.5"
        px="2"
        py="0.5"
        alignItems="center"
        css={{
          borderBottom: "1px solid",
          borderColor: "border.subtle",
          bg: "toolbar.bg",
          overflowX: "auto",
          flexShrink: 0,
          "&::-webkit-scrollbar": { height: "2px" },
          "&::-webkit-scrollbar-thumb": { bg: "border.subtle", borderRadius: "1px" },
        }}
      >
        {/* toolbar contents unchanged */}
        <Flex alignItems="center" gap="0.5">
          <Select
            value={editor.isActive("heading") ? editor.getAttributes("heading").level : 0}
            onChange={(val) => {
              const level = Number(val);
              if (level === 0) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
              }
            }}
            options={HEADING_SIZES}
          />
        </Flex>

        <ToolbarDivider />

        <Flex alignItems="center" gap="0.5">
          <ToolBtn
            title="Bold (Ctrl+B)"
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 12a4 4 0 0 0 0-8H6v8" />
              <path d="M15 12a5 5 0 0 1 0 10H6v-10" />
            </svg>
          </ToolBtn>
          <ToolBtn
            title="Italic (Ctrl+I)"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" x2="15" y1="4" y2="4" />
              <line x1="9" x2="5" y1="20" y2="20" />
              <line x1="14" x2="10" y1="4" y2="20" />
            </svg>
          </ToolBtn>
          <ToolBtn
            title="Underline (Ctrl+U)"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4v6a6 6 0 0 0 12 0V4" />
              <line x1="4" x2="20" y1="20" y2="20" />
            </svg>
          </ToolBtn>
        </Flex>

        <ToolbarDivider />

        <Flex alignItems="center" gap="0.5">
          <Select
            value={editor.getAttributes("textStyle").fontFamily || "var(--font-geist-sans), sans-serif"}
            onChange={(val) => {
              if (val === "var(--font-geist-sans), sans-serif") {
                editor.chain().focus().unsetFontFamily().run();
              } else {
                editor.chain().focus().setFontFamily(val).run();
              }
            }}
            options={FONT_FAMILIES}
          />
        </Flex>

        <ToolbarDivider />

        <Flex alignItems="center" gap="0.5">
          <ToolBtn
            title="Bullet list"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" x2="21" y1="6" y2="6" />
              <line x1="8" x2="21" y1="12" y2="12" />
              <line x1="8" x2="21" y1="18" y2="18" />
              <circle cx="4" cy="6" r="1" />
              <circle cx="4" cy="12" r="1" />
              <circle cx="4" cy="18" r="1" />
            </svg>
          </ToolBtn>
          <ToolBtn
            title="Ordered list"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="10" x2="21" y1="6" y2="6" />
              <line x1="10" x2="21" y1="12" y2="12" />
              <line x1="10" x2="21" y1="18" y2="18" />
              <path d="M4 6h1v4" />
              <path d="M4 10h2" />
              <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
            </svg>
          </ToolBtn>
        </Flex>

        <Spacer />
      </Flex>

        <Box css={{ borderBottom: "1px solid #a8a8a8" }} mb={0} mt={0} />
      </>
    );
}

