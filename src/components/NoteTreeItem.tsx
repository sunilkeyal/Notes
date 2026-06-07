"use client";

import { useState, useRef, useEffect } from "react";
import { type Note } from "@/types";

interface NoteTreeItemProps {
  note: Note;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onMoveNote: (noteId: string, targetFolderId: string | null) => void;
  onRename: (id: string, title: string) => void;
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
      <mark className="bg-amber-200/60 dark:bg-amber-300/20 text-inherit rounded-sm px-0.5">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

function containsMatchingChild(note: Note, query: string): boolean {
  if (!query) return false;
  return note.children.some(
    (child) =>
      child.title.toLowerCase().includes(query.toLowerCase()) ||
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
  searchQuery,
  depth,
}: NoteTreeItemProps) {
  const [dragOver, setDragOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(note.title);
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
    <li
      ref={liRef}
      role="treeitem"
      aria-selected={isSelected}
      aria-expanded={isFolder ? isExpanded : undefined}
      onDragOver={isFolder ? handleDragOver : undefined}
      onDragLeave={isFolder ? handleDragLeave : undefined}
      onDrop={isFolder ? handleDrop : undefined}
      className={`relative transition-colors ${
        isFolder && dragOver
          ? "bg-[var(--accent)]/5 ring-2 ring-[var(--accent)] ring-dashed"
          : ""
      }`}
    >
      <button
        type="button"
        draggable={isNote}
        onDragStart={isNote ? handleDragStart : undefined}
        onClick={() => onSelect(note.id)}
        onDoubleClick={(e) => {
          e.preventDefault();
          setEditValue(note.title);
          setIsEditing(true);
        }}
        className={`w-full flex items-center gap-1 px-2 py-1 text-left text-sm transition-colors cursor-pointer ${
          isSelected
            ? "bg-[var(--sidebar-active)] text-[var(--foreground)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
        } ${isNote ? "cursor-grab active:cursor-grabbing" : ""}`}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        {isFolder ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onToggle(note.id);
            }}
            className={`shrink-0 w-4 h-4 flex items-center justify-center transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
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
          </span>
        ) : (
          <span className="shrink-0 w-4 h-4 flex items-center justify-center opacity-0">
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
          </span>
        )}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
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
            className="flex-1 min-w-0 bg-transparent text-sm text-[var(--foreground)] outline-none border border-[var(--accent)] rounded px-1 py-0"
          />
        ) : (
          <span className="truncate flex-1">
            {searchQuery ? highlightMatch(note.title, searchQuery) : note.title}
          </span>
        )}
      </button>

      {isFolder && isExpanded && (
        <ul role="group" className="space-y-0.5">
          {note.children.map((child) => (
              <NoteTreeItem
                  key={child.id}
                  note={child}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onToggle={onToggle}
                  onMoveNote={onMoveNote}
                  onRename={onRename}
                  searchQuery={searchQuery}
                  depth={1}
                />
          ))}
        </ul>
      )}
    </li>
  );
}
