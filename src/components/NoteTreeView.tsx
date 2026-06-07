"use client";

import { useState, useEffect, useRef } from "react";
import { Box, Flex, Text, Input, IconButton } from "@chakra-ui/react";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredNotes = filterTree(notes, searchQuery);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  const openSearch = () => {
    setSearchOpen(true);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    onSearchChange("");
  };

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
      closeSearch();
    }
  };

  return (
    <Flex direction="column" h="full" css={{ bg: "bg.subtle" }}>
      <Flex align="center" gap="2" px="2" h="10" flexShrink="0">
        {searchOpen ? (
          <Flex align="center" gap="1.5" w="full">
            <IconButton
              size="xs"
              variant="ghost"
              onClick={closeSearch}
              aria-label="Close search"
              css={{ color: "fg.muted", _hover: { bg: "bg.muted", color: "fg.subtle" } }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
              </svg>
            </IconButton>
            <Box position="relative" flex="1" display="flex" alignItems="center">
              <Box
                position="absolute"
                left="2"
                top="50%"
                css={{ transform: "translateY(-50%)", color: "fg.muted", pointerEvents: "none" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </Box>
              <Input
                ref={searchInputRef}
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                variant="outline"
                css={{
                  flex: 1,
                  h: 8,
                  paddingLeft: "2rem",
                  paddingRight: "0.25rem",
                  fontSize: "sm",
                  bg: "bg.muted",
                  color: "fg.subtle",
                  _placeholder: { color: "fg.muted" },
                  border: 0,
                  outline: "none",
                  _focus: { bg: "bg.emphasized" },
                }}
              />
              {searchQuery && (
                <Flex align="center" gap="0.5" flexShrink="0" ml="1">
                  <IconButton
                    size="xs"
                    variant="ghost"
                    onClick={() => onSearchNav("up")}
                    aria-label="Previous match"
                    css={{ color: "fg.muted", _hover: { bg: "bg.muted", color: "fg.subtle" } }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </IconButton>
                  <IconButton
                    size="xs"
                    variant="ghost"
                    onClick={() => onSearchNav("down")}
                    aria-label="Next match"
                    css={{ color: "fg.muted", _hover: { bg: "bg.muted", color: "fg.subtle" } }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </IconButton>
                </Flex>
              )}
            </Box>
          </Flex>
        ) : (
          <Flex align="center" gap="0.5">
            <IconButton
              size="xs"
              variant="ghost"
              onClick={openSearch}
              aria-label="Search"
              css={{ color: "fg.muted", _hover: { bg: "bg.muted", color: "fg.subtle" } }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </IconButton>
            <IconButton
              size="xs"
              variant="ghost"
              onClick={onNewNote}
              aria-label="New note"
              css={{ color: "fg.muted", _hover: { bg: "bg.muted", color: "fg.subtle" } }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
              </svg>
            </IconButton>
            <IconButton
              size="xs"
              variant="ghost"
              onClick={onNewFolder}
              aria-label="New folder"
              css={{ color: "fg.muted", _hover: { bg: "bg.muted", color: "fg.subtle" } }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                <line x1="12" x2="12" y1="10" y2="16" /><line x1="9" x2="15" y1="13" y2="13" />
              </svg>
            </IconButton>
          </Flex>
        )}
      </Flex>

      <Box
        as="nav"
        flex="1"
        overflowY="auto"
        px="2"
        pb="3"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {filteredNotes.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            h="full"
            textAlign="center"
            px="4"
            rounded="lg"
            css={{
              transition: "colors 200ms",
              ...(dragOver
                ? { bg: "bg.emphasized", boxShadow: "0 0 0 2px accent" }
                : {}),
            }}
          >
            <Box w={10} h={10} mb={3} css={{ color: "fg.muted" }}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="100%"
                height="100%"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
                <line x1="8" x2="14" y1="11" y2="11" />
              </svg>
            </Box>
            <Text fontSize="sm" fontWeight="medium" css={{ color: "fg.subtle" }}>
              {searchQuery ? "No notes found" : "No notes yet"}
            </Text>
            <Text fontSize="xs" mt="1" css={{ color: "fg.muted" }}>
              {searchQuery
                ? "Try a different search term"
                : "Create a new note to get started"}
            </Text>
          </Flex>
        ) : (
          <Box as="ul" css={{ "& > * + *": { marginTop: "0.125rem" } }} role="tree">
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
          </Box>
        )}
      </Box>
    </Flex>
  );
}
