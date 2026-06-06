"use client";

import { useState, useRef } from "react";
import { type Note } from "@/types";

interface NoteTreeItemProps {
  note: Note;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onMoveNote: (noteId: string, targetFolderId: string | null) => void;
  searchQuery: string;
  depth: number;
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
  searchQuery,
  depth,
}: NoteTreeItemProps) {
  const [dragOver, setDragOver] = useState(false);
  const liRef = useRef<HTMLLIElement>(null);

  const isSelected = selectedId === note.id;
  const isFolder = note.type === "folder";
  const isNote = note.type === "note";
  const hasMatchingChild = isFolder && containsMatchingChild(note, searchQuery);

  const isExpanded = searchQuery
    ? note.isExpanded || hasMatchingChild
    : note.isExpanded;

  const paddingLeft = 8 + depth * 16;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", note.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isFolder) return;
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
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId && draggedId !== note.id) {
      onMoveNote(draggedId, note.id);
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
      className={`relative rounded-lg transition-colors ${
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
        className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left text-xs font-medium transition-colors cursor-pointer ${
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
            className={`shrink-0 w-4 h-4 flex items-center justify-center rounded transition-transform ${
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
          <span className="shrink-0 w-4 h-4 flex items-center justify-center">
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
        <span className="truncate flex-1">
          {searchQuery ? highlightMatch(note.title, searchQuery) : note.title}
        </span>
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
              searchQuery={searchQuery}
              depth={1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
