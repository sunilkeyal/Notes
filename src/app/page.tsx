"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { type Note } from "@/types";
import NoteTreeView from "@/components/NoteTreeView";
import RichEditor from "@/components/RichEditor";
import { SEED_NOTES } from "@/lib/seed";
import { Box, Flex, Text, Heading, IconButton } from "@chakra-ui/react";

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
  const [searchNavIndex, setSearchNavIndex] = useState(0);
  const [searchMatchCount, setSearchMatchCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLoaded = useRef(false);
  const prevSelectedId = useRef(selectedId);

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

  useEffect(() => {
    if (prevSelectedId.current !== selectedId) {
      prevSelectedId.current = selectedId;
      setSearchNavIndex(0);
    }
  }, [selectedId]);

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

  const handleDelete = useCallback((id: string) => {
    setNotes((prev) => {
      const { nodes, removed } = removeNoteById(prev, id);
      if (removed && removed.id === selectedId) {
        const next = findFirstNote(nodes);
        setSelectedId(next?.id ?? "");
      }
      return nodes;
    });
  }, [selectedId]);

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

  const handleSearchNav = useCallback((dir: "up" | "down") => {
    setSearchNavIndex((prev) => {
      const max = Math.max(0, searchMatchCount - 1);
      if (dir === "down") return Math.min(prev + 1, max);
      return Math.max(prev - 1, 0);
    });
  }, [searchMatchCount]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setSearchNavIndex(0);
  }, []);

  const handleSearchMatches = useCallback((count: number) => {
    setSearchMatchCount(count);
  }, []);

  return (
    <Flex flexDir="column" h="full">
      {/* Global header */}
      <Flex as="header" alignItems="center" gap="3" px="4" h="10" css={{ borderBottom: "1px solid", borderColor: "border", bg: "bg.header", flexShrink: 0 }}>
        <IconButton
          size="sm"
          onClick={() => setSidebarOpen(true)}
          hideFrom="md"
          variant="ghost"
          aria-label="Open sidebar"
          css={{ color: "fg.subtle", _hover: { bg: "bg.muted" } }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" x2="21" y1="6" y2="6" />
            <line x1="3" x2="21" y1="12" y2="12" />
            <line x1="3" x2="21" y1="18" y2="18" />
          </svg>
        </IconButton>
        <Box as="span" css={{ color: "fg.muted" }} flexShrink={0}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v16.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V5.5L15.5 2z" />
            <polyline points="15.5 2 15.5 5.5 19 5.5" />
            <line x1="9" x2="14" y1="10" y2="10" />
            <line x1="9" x2="16" y1="14" y2="14" />
            <line x1="9" x2="12" y1="18" y2="18" />
          </svg>
        </Box>
        <Heading as="h1" fontSize="sm" fontWeight="semibold" css={{ color: "fg" }}>Notes</Heading>
      </Flex>

      <Flex flex="1" css={{ minHeight: 0, bg: "bg" }}>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <Box
            position="fixed"
            inset="0"
            zIndex="30"
            onClick={() => setSidebarOpen(false)}
            hideFrom="md"
            css={{ bg: "overlay", backdropFilter: "blur(4px)" }}
          />
        )}

        {/* Sidebar */}
        <Box
          as="aside"
          css={{
            width: "280px",
            flexShrink: 0,
            transition: "transform 300ms ease-out",
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            "@media (min-width: 768px)": {
              position: "relative",
              transform: "translateX(0)",
              zIndex: "auto",
            },
            position: "fixed",
            insetY: 0,
            left: 0,
            zIndex: 40,
          }}
        >
          <NoteTreeView
            notes={notes}
            selectedId={selectedId}
            onSelect={handleSelect}
            onToggle={handleToggle}
            onMoveNote={handleMoveNote}
            onRename={handleUpdateName}
            onDelete={handleDelete}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onSearchNav={handleSearchNav}
            onNewNote={handleNewNote}
            onNewFolder={handleNewFolder}
          />
        </Box>

        {/* Main content */}
        <Box as="main" flex="1" display="flex" flexDir="column" minW="0">
          {selectedNote && selectedNote.type === "note" ? (
            <RichEditor
              key={selectedNote.id}
              note={selectedNote}
              onUpdate={handleUpdate}
              onUpdateName={handleUpdateName}
              searchQuery={searchQuery}
              searchNavIndex={searchNavIndex}
              onSearchMatches={handleSearchMatches}
            />
          ) : (
            <Flex flex="1" alignItems="center" justifyContent="center" css={{ bg: "bg.surface" }}>
              <Box textAlign="center" px="6">
                <Box css={{ color: "fg.muted" }} mb="4">
                  <svg
                    width="48"
                    height="48"
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
                </Box>
                <Text fontSize="sm" fontWeight="medium" css={{ color: "fg.subtle" }}>
                  Select a note from the sidebar
                </Text>
                <Text fontSize="xs" mt="1.5" css={{ color: "fg.muted" }}>
                  {selectedNote
                    ? "This is a folder — select a note inside it"
                    : "Select a note to start editing"}
                </Text>
              </Box>
            </Flex>
          )}
        </Box>
      </Flex>
    </Flex>
  );
}