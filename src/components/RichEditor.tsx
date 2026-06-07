"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import FontFamily from "@tiptap/extension-font-family";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import { ResizableImage } from "@/extensions/ResizableImage";
import { type Note } from "@/types";
import EditorToolbar from "./EditorToolbar";
import { useEffect } from "react";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${date}   ${time}`;
}

interface RichEditorProps {
  note: Note;
  onUpdate: (id: string, content: string) => void;
  onUpdateName: (id: string, title: string) => void;
}

export default function RichEditor({ note, onUpdate, onUpdateName }: RichEditorProps) {
  const editor = useEditor({
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      FontSize,
      FontFamily,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ResizableImage.configure({ inline: false, allowBase64: true }),
    ],
    content: note.content ?? "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none focus:outline-none",
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (files?.length) {
          const imageFile = Array.from(files).find((f) =>
            f.type.startsWith("image/")
          );
          if (imageFile) {
            event.preventDefault();
            const reader = new FileReader();
            reader.onload = (ev) => {
              const url = ev.target?.result as string;
              const { state, dispatch } = view;
              const node = state.schema.nodes.image?.create({
                src: url,
              });
              if (node) {
                const tr = state.tr.replaceSelectionWith(node);
                dispatch(tr);
              }
            };
            reader.readAsDataURL(imageFile);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      onUpdate(note.id, ed.getHTML());
    },
  });

  useEffect(() => {
    if (editor && note.content && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]);

  return (
    <div className="flex flex-col h-full bg-[var(--editor-bg)]">
      <EditorToolbar editor={editor} />
      <div
        className="flex-1 overflow-y-auto"
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
          }
        }}
      >
        <div className="max-w-4xl px-8 py-6 sm:px-12 sm:py-8">
          <input
            type="text"
            value={note.title}
            onChange={(e) => onUpdateName(note.id, e.target.value)}
            className="w-full bg-transparent text-[2.5rem] font-bold text-[var(--foreground)] outline-none border-none p-0 mb-1 tracking-tight"
            placeholder="Untitled"
          />
          <p className="text-sm text-[var(--text-muted)] mb-6">
            {note.lastUpdated ? formatDate(note.lastUpdated) : ""}
          </p>
          <EditorContent editor={editor} className="min-h-full" />
        </div>
      </div>
    </div>
  );
}
