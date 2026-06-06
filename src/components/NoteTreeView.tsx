"use client";

import { useState } from "react";
import { type Note } from "@/types";
import NoteTreeItem from "./NoteTreeItem";

interface NoteTreeViewProps {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onMoveNote: (noteId: string, targetFolderId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function flattenNotes(note: Note, query: string): Note[] {
  const matches =
    query === "" ||
    note.title.toLowerCase().includes(query.toLowerCase());
  const results: Note[] = [];
  if (matches) results.push(note);
  for (const child of note.children) {
    results.push(...flattenNotes(child, query));
  }
  return results;
}

export default function NoteTreeView({
  notes,
  selectedId,
  onSelect,
  onToggle,
  onMoveNote,
  searchQuery,
  onSearchChange,
}: NoteTreeViewProps) {
  const [dragOver, setDragOver] = useState(false);

  const filteredNotes = searchQuery
    ? notes
        .map((note) => {
          const flat = flattenNotes(note, searchQuery);
          if (flat.length === 0) return null;
          return note;
        })
        .filter(Boolean) as Note[]
    : notes;

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("text/plain")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const noteId = e.dataTransfer.getData("text/plain");
    if (noteId) {
      onMoveNote(noteId, null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]">
      <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--sidebar-border)] shrink-0">
        <h1 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
          Notes
        </h1>
        <span className="text-[10px] font-medium text-[var(--text-muted)] bg-[var(--sidebar-hover)] px-2 py-0.5 rounded-full">
          {notes.length}
        </span>
      </div>

      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-[var(--sidebar-border)] bg-[var(--editor-bg)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      <nav
        className="flex-1 overflow-y-auto px-2 pb-3"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {filteredNotes.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center h-full text-center px-4 rounded-lg transition-colors ${
              dragOver ? "bg-[var(--sidebar-active)] ring-2 ring-[var(--accent)] ring-dashed" : ""
            }`}
          >
            <svg
              className="w-8 h-8 text-[var(--text-muted)] mb-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" x2="15" y1="15" y2="15" />
            </svg>
            <p className="text-xs text-[var(--text-muted)]">
              {searchQuery ? "No results found" : "No notes yet"}
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5" role="tree">
            {filteredNotes.map((note) => (
              <NoteTreeItem
                key={note.id}
                note={note}
                selectedId={selectedId}
                onSelect={onSelect}
                onToggle={onToggle}
                onMoveNote={onMoveNote}
                searchQuery={searchQuery}
                depth={0}
              />
            ))}
          </ul>
        )}
      </nav>
    </div>
  );
}
