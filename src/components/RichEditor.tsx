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
import { useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { Box, Flex, Text, Input } from "@chakra-ui/react";

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

export interface RichEditorHandle {
  searchAndNavigate: (query: string, dir: "up" | "down") => void;
}

interface RichEditorProps {
  note: Note;
  onUpdate: (id: string, content: string) => void;
  onUpdateName: (id: string, title: string) => void;
  searchQuery: string;
  searchNavIndex: number;
  onSearchMatches: (count: number) => void;
}

const RichEditor = forwardRef<RichEditorHandle, RichEditorProps>(function RichEditor({
  note,
  onUpdate,
  onUpdateName,
  searchQuery,
  searchNavIndex,
  onSearchMatches,
}, ref) {
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
        class: "focus:outline-none",
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

  function findSearchPositions(): { from: number; to: number }[] {
    if (!editor || !searchQuery) return [];
    const positions: { from: number; to: number }[] = [];
    const q = searchQuery.toLowerCase();
    const { doc } = editor.state;

    doc.descendants((node: any, pos: number) => {
      if (node.isText) {
        const text = node.text?.toLowerCase() ?? "";
        let idx = 0;
        while ((idx = text.indexOf(q, idx)) !== -1) {
          positions.push({ from: pos + idx, to: pos + idx + q.length });
          idx += q.length;
        }
      }
      return true;
    });

    return positions;
  }

  function goToMatch(index: number) {
    if (!editor) return;
    const matches = findSearchPositions();
    if (matches.length === 0) return;
    const idx = ((index % matches.length) + matches.length) % matches.length;
    const match = matches[idx];
    editor.commands.setTextSelection({ from: match.from, to: match.to });
    editor.commands.scrollIntoView();
    editor.commands.focus();
  }

  const prevSearchQuery = useRef(searchQuery);

  useEffect(() => {
    if (!editor) return;
    const matches = findSearchPositions();
    onSearchMatches(matches.length);
    if (matches.length > 0 && searchNavIndex >= 0) {
      const idx = ((searchNavIndex % matches.length) + matches.length) % matches.length;
      const match = matches[idx];
      editor.commands.setTextSelection({ from: match.from, to: match.to });
      editor.commands.scrollIntoView();
      const queryChanged = searchQuery !== prevSearchQuery.current;
      prevSearchQuery.current = searchQuery;
      if (!queryChanged) {
        editor.commands.focus();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchNavIndex, searchQuery, note.id]);

  useImperativeHandle(ref, () => ({
    searchAndNavigate(query: string, dir: "up" | "down") {
      // handled via props
    },
  }));

  return (
    <Flex direction="column" h="full" css={{ bg: "bg.surface", color: "fg" }}>
        <EditorToolbar editor={editor} />
        <Box
          flex={1}
          overflowY="auto"
          css={{
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": { bg: "border.subtle", borderRadius: "3px" },
            "&::-webkit-scrollbar-track": { bg: "transparent" },
          }}
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes("Files")) {
              e.preventDefault();
            }
          }}
        >
          <Box maxW="4xl" mx="auto" px={{ base: 4, sm: 6, md: 10 }} py={{ base: 4, sm: 6, md: 8 }}>
            <Input
              variant="subtle"
              fontSize="xl"
              fontWeight="bold"
              letterSpacing="tight"
              w="full"
              mb={0.5}
              type="text"
              value={note.title}
              onChange={(e) => onUpdateName(note.id, e.target.value)}
              placeholder="Untitled"
              css={{
                color: "fg",
                bg: "transparent",
                border: "none",
                borderRadius: 0,
                px: 0,
                _focus: { borderColor: "transparent", boxShadow: "none" },
                _placeholder: { color: "fg.muted" },
              }}
            />
            <Text fontSize="xs" css={{ color: "fg.muted" }} mb={5}>
              {note.lastUpdated ? formatDate(note.lastUpdated) : ""}
            </Text>
            <Box minH="full">
              <EditorContent editor={editor} />
            </Box>
          </Box>
        </Box>
    </Flex>
  );
});

export default RichEditor;
