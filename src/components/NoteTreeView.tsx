"use client";

import { useState, useEffect, useRef } from "react";
import { type Note } from "@/types";
import NoteTreeItem from "./NoteTreeItem";

interface NoteTreeViewProps {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onMoveNote: (noteId: string, targetFolderId: string | null) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchNav: (dir: "up" | "down") => void;
  onNewNote: () => void;
  onNewFolder: () => void;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function noteMatches(note: Note, q: string): boolean {
  if (note.title.toLowerCase().includes(q)) return true;
  if (note.type === "note" && note.content && stripHtml(note.content).toLowerCase().includes(q)) return true;
  return false;
}

function filterTree(nodes: Note[], query: string): Note[] {
  if (!query) return nodes;
  const q = query.toLowerCase();
  return nodes.reduce<Note[]>((acc, node) => {
    if (node.type === "folder") {
      const filteredChildren = filterTree(node.children, query);
      if (noteMatches(node, q) || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren, isExpanded: true });
      }
    } else if (noteMatches(node, q)) {
      acc.push(node);
    }
    return acc;
  }, []);
}


export default function NoteTreeView({
  notes,
  selectedId,
  onSelect,
  onToggle,
  onMoveNote,
  onRename,
  onDelete,
  searchQuery,
  onSearchChange,
  onSearchNav,
  onNewNote,
  onNewFolder,
}: NoteTreeViewProps) {
  const [dragOver, setDragOver] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredNotes = filterTree(notes, searchQuery);

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

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      onSearchChange("");
      searchInputRef.current?.focus();
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
        <div className="relative flex items-center gap-1">
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
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="flex-1 h-8 pl-8 pr-1 text-sm rounded border-0 bg-[var(--sidebar-hover)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition-colors focus:bg-[var(--sidebar-active)]"
          />
          {searchQuery && (
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => onSearchNav("up")}
                className="flex items-center justify-center w-6 h-6 rounded text-[var(--text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)] transition-colors"
                title="Previous match"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onSearchNav("down")}
                className="flex items-center justify-center w-6 h-6 rounded text-[var(--text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)] transition-colors"
                title="Next match"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
          )}
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
              className="w-10 h-10 text-[var(--text-muted)] mb-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
              <line x1="8" x2="14" y1="11" y2="11" />
            </svg>
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {searchQuery ? "No notes found" : "No notes yet"}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {searchQuery
                ? "Try a different search term"
                : "Create a new note to get started"}
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
                onDelete={onDelete}
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