"use client";

import { type Editor } from "@tiptap/react";
import { useCallback } from "react";

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
  title: string;
}

function ToolBtn({ onClick, isActive, title, children }: ToolBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center w-8 h-8 rounded-md text-sm transition-colors ${
        isActive
          ? "bg-[var(--sidebar-active)] text-[var(--accent)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
      }`}
    >
      {children}
    </button>
  );
}

function Select({ value, onChange, options }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 rounded-md border-0 bg-transparent px-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] cursor-pointer outline-none appearance-none"
    >
      {options.map((opt) => (
        <option key={String(opt.value)} value={String(opt.value)}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

const HEADING_SIZES = [
  { label: "Normal", value: 0 },
  { label: "H1", value: 1 },
  { label: "H2", value: 2 },
  { label: "H3", value: 3 },
];

const FONT_SIZES = [
  { label: "XS", value: "0.625rem" },
  { label: "S", value: "0.75rem" },
  { label: "Normal", value: "0.875rem" },
  { label: "M", value: "1rem" },
  { label: "L", value: "1.125rem" },
  { label: "XL", value: "1.25rem" },
];

const FONT_FAMILIES = [
  { label: "Default", value: "var(--font-geist-sans), sans-serif" },
  { label: "Serif", value: "Georgia, Cambria, 'Times New Roman', Times, serif" },
  { label: "Mono", value: "'JetBrains Mono', 'Fira Code', monospace" },
];

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 px-4 py-2 border-b border-[var(--toolbar-border)] bg-[var(--toolbar-bg)] flex-wrap">
      <div className="flex items-center gap-0.5 mr-1">
        <Select
          title="Heading level"
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
      </div>

      <div className="flex items-center gap-0.5">
        <ToolBtn
          title="Bold (Ctrl+B)"
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 12a4 4 0 0 0 0-8H6v8" /><path d="M15 12a5 5 0 0 1 0 10H6v-10" />
          </svg>
        </ToolBtn>
        <ToolBtn
          title="Italic (Ctrl+I)"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" x2="15" y1="4" y2="4" /><line x1="9" x2="5" y1="20" y2="20" /><line x1="14" x2="10" y1="4" y2="20" />
          </svg>
        </ToolBtn>
        <ToolBtn
          title="Underline (Ctrl+U)"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4v6a6 6 0 0 0 12 0V4" /><line x1="4" x2="20" y1="20" y2="20" />
          </svg>
        </ToolBtn>
      </div>

      <div className="w-px h-5 bg-[var(--toolbar-border)] mx-1" />

      <div className="flex items-center gap-0.5">
        <Select
          title="Font family"
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
      </div>

      <div className="w-px h-5 bg-[var(--toolbar-border)] mx-1" />

      <div className="flex items-center gap-0.5">
        <ToolBtn
          title="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" />
          </svg>
        </ToolBtn>
        <ToolBtn
          title="Ordered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" x2="21" y1="6" y2="6" /><line x1="10" x2="21" y1="12" y2="12" /><line x1="10" x2="21" y1="18" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
          </svg>
        </ToolBtn>
      </div>

      <div className="ml-auto flex items-center gap-0.5">
        <ToolBtn title="Insert image" onClick={addImage}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </ToolBtn>
      </div>
    </div>
  );
}
