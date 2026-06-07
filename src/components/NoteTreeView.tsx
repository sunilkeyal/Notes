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
  onRename: (id: string, title: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewNote: () => void;
  onNewFolder: () => void;
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
  onRename,
  searchQuery,
  onSearchChange,
  onNewNote,
  onNewFolder,
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
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data?.id) {
        onMoveNote(data.id, null);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--sidebar-bg)]">
      <div className="flex items-center justify-between px-4 h-11 shrink-0">
        <h1 className="text-sm font-semibold text-[var(--foreground)]">
          Notes
        </h1>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onNewNote}
            className="flex items-center justify-center w-7 h-7 rounded text-[var(--text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)] transition-colors"
            title="New note"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onNewFolder}
            className="flex items-center justify-center w-7 h-7 rounded text-[var(--text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)] transition-colors"
            title="New folder"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
              <line x1="12" x2="12" y1="10" y2="16" /><line x1="9" x2="15" y1="13" y2="13" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-3 pb-2 shrink-0">
        <div className="relative">
          <svg
            className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-sm rounded border-0 bg-[var(--sidebar-hover)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition-colors focus:bg-[var(--sidebar-active)]"
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
                onRename={onRename}
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
