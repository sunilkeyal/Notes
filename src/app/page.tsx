"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { type Note } from "@/types";
import NoteTreeView from "@/components/NoteTreeView";
import RichEditor from "@/components/RichEditor";
import { SEED_NOTES } from "@/lib/seed";

function toggleNoteExpand(notes: Note[], id: string): Note[] {
  return notes.map((note) => {
    if (note.id === id) {
      return { ...note, isExpanded: !note.isExpanded };
    }
    return { ...note, children: toggleNoteExpand(note.children, id) };
  });
}

function updateNoteContent(
  notes: Note[],
  id: string,
  content: string
): Note[] {
  return notes.map((note) => {
    if (note.id === id) {
      return { ...note, content, lastUpdated: new Date().toISOString() };
    }
    return { ...note, children: updateNoteContent(note.children, id, content) };
  });
}

function updateNoteName(notes: Note[], id: string, title: string): Note[] {
  return notes.map((note) => {
    if (note.id === id) {
      return { ...note, title, lastUpdated: new Date().toISOString() };
    }
    return { ...note, children: updateNoteName(note.children, id, title) };
  });
}

function removeNoteById(nodes: Note[], id: string): { nodes: Note[]; removed: Note | null } {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      return { nodes: [...nodes.slice(0, i), ...nodes.slice(i + 1)], removed: nodes[i] };
    }
    const result = removeNoteById(nodes[i].children, id);
    if (result.removed) {
      const newNodes = [...nodes];
      newNodes[i] = { ...nodes[i], children: result.nodes };
      return { nodes: newNodes, removed: result.removed };
    }
  }
  return { nodes, removed: null };
}

function addNoteToFolder(nodes: Note[], folderId: string | null, note: Note): Note[] {
  if (folderId === null) {
    return [...nodes, note];
  }
  return nodes.map((n) => {
    if (n.id === folderId) {
      return { ...n, children: [...n.children, note] };
    }
    return { ...n, children: addNoteToFolder(n.children, folderId, note) };
  });
}

function findNote(notes: Note[], id: string): Note | null {
  for (const note of notes) {
    if (note.id === id) return note;
    const found = findNote(note.children, id);
    if (found) return found;
  }
  return null;
}

function findFirstNote(nodes: Note[]): Note | null {
  for (const n of nodes) {
    if (n.type === "note") return n;
    const found = findFirstNote(n.children);
    if (found) return found;
  }
  return null;
}

function findParentFolderId(notes: Note[], id: string): string | null {
  for (const note of notes) {
    if (note.children.some((c) => c.id === id)) return note.id;
    const found = findParentFolderId(note.children, id);
    if (found !== null) return found;
  }
  return null;
}

function createNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function addNoteToTree(notes: Note[], parentId: string | null, note: Note): Note[] {
  if (parentId === null) {
    return [...notes, note];
  }
  return notes.map((n) => {
    if (n.id === parentId) {
      return { ...n, children: [...n.children, note], isExpanded: true };
    }
    return { ...n, children: addNoteToTree(n.children, parentId, note) };
  });
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLoaded = useRef(false);

  useEffect(() => {
    fetch("/api/notes")
      .then((res) => res.json())
      .then((data: Note[]) => {
        setNotes(data);
        isLoaded.current = true;
        const first = findFirstNote(data);
        if (first) setSelectedId(first.id);
      })
      .catch(() => {
        setNotes(SEED_NOTES);
        isLoaded.current = true;
        const first = findFirstNote(SEED_NOTES);
        if (first) setSelectedId(first.id);
      });
  }, []);

  useEffect(() => {
    if (!isLoaded.current) return;
    const timer = setTimeout(() => {
      fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notes),
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [notes]);

  const selectedNote = findNote(notes, selectedId ?? "");

  const handleToggle = useCallback((id: string) => {
    setNotes((prev) => toggleNoteExpand(prev, id));
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      setSidebarOpen(false);
    },
    []
  );

  const handleUpdate = useCallback((id: string, content: string) => {
    setNotes((prev) => updateNoteContent(prev, id, content));
  }, []);

  const handleUpdateName = useCallback((id: string, title: string) => {
    setNotes((prev) => updateNoteName(prev, id, title));
  }, []);

  const handleMoveNote = useCallback((noteId: string, targetFolderId: string | null) => {
    setNotes((prev) => {
      const { nodes, removed } = removeNoteById(prev, noteId);
      if (!removed) return prev;
      if (removed.type === "folder" && targetFolderId !== null) return prev;
      return addNoteToFolder(nodes, targetFolderId, removed);
    });
  }, []);

  const handleNewNote = useCallback(() => {
    const id = createNoteId();
    const now = new Date().toISOString();
    const parentId = selectedId
      ? findNote(notes, selectedId)?.type === "folder"
        ? selectedId
        : findParentFolderId(notes, selectedId)
      : null;
    const note: Note = {
      id,
      title: "Untitled",
      type: "note",
      content: "",
      children: [],
      lastUpdated: now,
    };
    setNotes((prev) => addNoteToTree(prev, parentId, note));
    setSelectedId(id);
  }, [notes, selectedId]);

  const handleNewFolder = useCallback(() => {
    const id = createNoteId();
    const now = new Date().toISOString();
    const folder: Note = {
      id,
      title: "New Folder",
      type: "folder",
      children: [],
      lastUpdated: now,
    };
    setNotes((prev) => addNoteToTree(prev, null, folder));
  }, []);

  return (
    <div className="flex h-full bg-[var(--background)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 md:z-auto inset-y-0 left-0 w-[280px] shrink-0 transition-transform duration-300 ease-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NoteTreeView
          notes={notes}
          selectedId={selectedId}
          onSelect={handleSelect}
          onToggle={handleToggle}
          onMoveNote={handleMoveNote}
          onRename={handleUpdateName}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewNote={handleNewNote}
          onNewFolder={handleNewFolder}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="flex items-center gap-3 h-11 px-4 border-b border-[var(--sidebar-border)] bg-[var(--toolbar-bg)] md:hidden shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-md text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]"
            aria-label="Open sidebar"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" x2="21" y1="6" y2="6" />
              <line x1="3" x2="21" y1="12" y2="12" />
              <line x1="3" x2="21" y1="18" y2="18" />
            </svg>
          </button>
          <h1 className="text-sm font-semibold truncate text-[var(--foreground)]">
            {selectedNote?.title ?? "Notes"}
          </h1>
        </div>

        {selectedNote && selectedNote.type === "note" ? (
          <RichEditor
            key={selectedNote.id}
            note={selectedNote}
            onUpdate={handleUpdate}
            onUpdateName={handleUpdateName}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[var(--editor-bg)]">
            <div className="text-center px-6">
              <svg
                className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" x2="8" y1="13" y2="13" />
                <line x1="16" x2="8" y1="17" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                Select a note from the sidebar
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1.5">
                {selectedNote
                  ? "This is a folder — select a note inside it"
                  : "Select a note to start editing"}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
