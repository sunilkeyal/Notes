"use client";

import { useState, useRef, useEffect } from "react";
import { type Note } from "@/types";
import ConfirmDialog from "./ConfirmDialog";
import { Box, Input } from "@chakra-ui/react";

interface NoteTreeItemProps {
  note: Note;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onMoveNote: (noteId: string, targetFolderId: string | null) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  searchQuery: string;
  depth: number;
}

function parseDragData(dt: DataTransfer): { id: string; type: string } | null {
  try {
    return JSON.parse(dt.getData("text/plain"));
  } catch {
    return null;
  }
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <Box as="mark" css={{ bg: "highlight", color: "inherit", borderRadius: "2px", px: "2px" }}>
        {text.slice(idx, idx + q.length)}
      </Box>
      {text.slice(idx + q.length)}
    </>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function getSmartSnippet(content: string | undefined, query: string): string | null {
  if (!content || !query) return null;
  const stripped = stripHtml(content);
  const q = query.toLowerCase();
  const text = stripped.toLowerCase();
  const idx = text.indexOf(q);
  if (idx === -1) return null;

  const contextLen = 50;
  const start = Math.max(0, idx - contextLen);
  const end = Math.min(stripped.length, idx + q.length + contextLen);

  let snippet = stripped.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < stripped.length) snippet = snippet + "...";

  return snippet;
}

function containsMatchingChild(note: Note, query: string): boolean {
  if (!query) return false;
  const q = query.toLowerCase();
  return note.children.some(
    (child) =>
      child.title.toLowerCase().includes(q) ||
      (child.content && stripHtml(child.content).toLowerCase().includes(q)) ||
      containsMatchingChild(child, query)
  );
}

export default function NoteTreeItem({
  note,
  selectedId,
  onSelect,
  onToggle,
  onMoveNote,
  onRename,
  onDelete,
  searchQuery,
  depth,
}: NoteTreeItemProps) {
  const [dragOver, setDragOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(note.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const liRef = useRef<HTMLLIElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      requestAnimationFrame(() => inputRef.current?.select());
    }
  }, [isEditing]);

  function commitRename() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== note.title) {
      onRename(note.id, trimmed);
    }
    setIsEditing(false);
  }

  const isSelected = selectedId === note.id;
  const isFolder = note.type === "folder";
  const isNote = note.type === "note";

  const snippet = isNote ? getSmartSnippet(note.content, searchQuery) : null;

  function countDescendants(n: Note): number {
    let count = 0;
    for (const child of n.children) {
      if (child.type === "note") count++;
      count += countDescendants(child);
    }
    return count;
  }

  const childCount = isFolder ? countDescendants(note) : null;
  const hasMatchingChild = isFolder && containsMatchingChild(note, searchQuery);

  const isExpanded = searchQuery
    ? note.isExpanded || hasMatchingChild
    : note.isExpanded;

  const paddingLeft = 8 + depth * 16;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ id: note.id, type: note.type }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isFolder) return;
    const dragged = parseDragData(e.dataTransfer);
    if (dragged?.type === "folder") return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (liRef.current && liRef.current.contains(e.relatedTarget as Node)) return;
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const dragged = parseDragData(e.dataTransfer);
    if (dragged && dragged.id !== note.id) {
      onMoveNote(dragged.id, note.id);
    }
  };

  return (
    <Box
      as="li"
      ref={liRef}
      role="treeitem"
      aria-selected={isSelected}
      aria-expanded={isFolder ? isExpanded : undefined}
      onDragOver={isFolder ? handleDragOver : undefined}
      onDragLeave={isFolder ? handleDragLeave : undefined}
      onDrop={isFolder ? handleDrop : undefined}
      css={{
        position: "relative",
        ...(isFolder && dragOver
          ? { bg: "color-mix(in srgb, var(--chakra-colors-accent) 5%, transparent)", outline: "2px dashed var(--chakra-colors-accent)" }
          : {}),
      }}
    >
      <Box
        as="button"
        draggable={isNote}
        onDragStart={isNote ? handleDragStart : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onSelect(note.id)}
        onDoubleClick={(e) => {
          e.preventDefault();
          setEditValue(note.title);
          setIsEditing(true);
        }}
        css={{
          width: "100%",
          display: "flex",
          alignItems: "flex-start",
          gap: "4px",
          px: "8px",
          py: "4px",
          textAlign: "left",
          fontSize: "14px",
          cursor: isNote ? "grab" : "pointer",
          transition: "all 0.12s",
          paddingLeft: `${paddingLeft}px`,
          borderLeft: "2px solid transparent",
          borderLeftColor: isSelected ? "accent" : "transparent",
          bg: isSelected ? "bg.emphasized" : "transparent",
          color: isSelected ? "fg" : "fg.subtle",
          fontWeight: isSelected ? "500" : "400",
          _hover: isSelected ? {} : {
            bg: "bg.muted",
            color: "fg",
          },
          ...(isNote ? { _active: { cursor: "grabbing" } } : {}),
        }}
      >
        {isFolder ? (
          <Box
            as="span"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(note.id);
            }}
            css={{
              flexShrink: 0,
              w: "16px",
              h: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.2s",
              mt: "2px",
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Box>
        ) : (
          <Box
            as="span"
            css={{
              flexShrink: 0,
              w: "16px",
              h: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: "2px",
              opacity: 0,
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </Box>
        )}
        <Box css={{ flex: 1, minWidth: 0 }}>
          {isEditing ? (
            <Input
              ref={inputRef}
              variant="outline"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitRename();
                } else if (e.key === "Escape") {
                  setIsEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              css={{
                width: "100%",
                bg: "transparent",
                fontSize: "14px",
                color: "fg",
                borderColor: "accent",
                borderRadius: "4px",
                px: "4px",
                py: 0,
                outline: "none",
                height: "auto",
              }}
            />
          ) : (
            <Box
              css={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {searchQuery ? highlightMatch(note.title, searchQuery) : note.title}
            </Box>
          )}
          {snippet && !isEditing && (
            <Box
              css={{
                fontSize: "12px",
                color: "fg.muted",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                mt: "2px",
                lineHeight: "relaxed",
              }}
            >
              {highlightMatch(snippet, searchQuery)}
            </Box>
          )}
        </Box>
        <Box
          as="span"
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            setConfirmDelete(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.stopPropagation(); setConfirmDelete(true); }
          }}
          title={`Delete "${note.title}"`}
          css={{
            flexShrink: 0,
            w: "24px",
            h: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
            color: "fg.muted",
            transition: "all 0.2s",
            visibility: isHovered ? "visible" : "hidden",
            pointerEvents: isHovered ? "auto" : "none",
            _hover: {
              bg: "bg.muted",
              color: "danger",
            },
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </Box>
      </Box>

      {isFolder && isExpanded && (
        <Box as="ul" role="group" css={{ "& > :not(:first-of-type)": { mt: "2px" } }}>
          {note.children.map((child) => (
            <NoteTreeItem
              key={child.id}
              note={child}
              selectedId={selectedId}
              onSelect={onSelect}
              onToggle={onToggle}
              onMoveNote={onMoveNote}
              onRename={onRename}
              onDelete={onDelete}
              searchQuery={searchQuery}
              depth={depth + 1}
            />
          ))}
        </Box>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title={isFolder ? "Delete folder" : "Delete note"}
        message={
          isFolder && childCount && childCount > 0
            ? `Delete "${note.title}" and all its contents? This folder contains ${childCount} note${childCount === 1 ? "" : "s"}. This action cannot be undone.`
            : isFolder
              ? `Delete "${note.title}"? This empty folder will be permanently removed.`
              : `Delete "${note.title}"? This action cannot be undone.`
        }
        onConfirm={() => {
          setConfirmDelete(false);
          onDelete(note.id);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </Box>
  );
}
