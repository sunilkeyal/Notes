import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { Note } from "@/types";
import { SEED_NOTES } from "@/lib/seed";

const DATA_DIR = path.join(process.cwd(), "data");
const NOTES_DIR = path.join(DATA_DIR, "notes");
const TREE_FILE = path.join(DATA_DIR, "tree.json");
const OLD_DATA_FILE = path.join(DATA_DIR, "notes.json");

async function ensureDirs() {
  await fs.mkdir(NOTES_DIR, { recursive: true });
}

function stripContent(note: Note): Note {
  const { content: _, ...rest } = note;
  return { ...rest, children: note.children.map(stripContent) };
}

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").replace(/\s+/g, " ").trim() || "untitled";
}

function assignFilenames(notes: Note[]): Map<string, string> {
  const taken = new Set<string>();
  const map = new Map<string, string>();

  function walk(nodes: Note[]) {
    for (const n of nodes) {
      if (n.type === "note") {
        const base = sanitizeFilename(n.title);
        let filename = `${base}.json`;
        let counter = 1;
        while (taken.has(filename)) {
          counter++;
          filename = `${base} (${counter}).json`;
        }
        taken.add(filename);
        map.set(n.id, filename);
      }
      walk(n.children);
    }
  }

  walk(notes);
  return map;
}

async function readTree(): Promise<Note[]> {
  await ensureDirs();
  const raw = await fs.readFile(TREE_FILE, "utf-8");
  return JSON.parse(raw) as Note[];
}

async function writeTree(notes: Note[]) {
  await ensureDirs();
  const stripped = notes.map(stripContent);
  await fs.writeFile(TREE_FILE, JSON.stringify(stripped, null, 2), "utf-8");
}

async function readNoteContent(filename: string): Promise<{ content?: string; lastUpdated?: string }> {
  try {
    const raw = await fs.readFile(path.join(NOTES_DIR, filename), "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeNoteContent(filename: string, content: string | undefined, lastUpdated: string | undefined) {
  if (content === undefined) return;
  await fs.writeFile(
    path.join(NOTES_DIR, filename),
    JSON.stringify({ content, lastUpdated }, null, 2),
    "utf-8"
  );
}

async function mergeContent(notes: Note[], filenames: Map<string, string>): Promise<Note[]> {
  return Promise.all(
    notes.map(async (note) => {
      if (note.type === "note") {
        const fname = filenames.get(note.id);
        const saved = fname ? await readNoteContent(fname) : {};
        return { ...note, content: saved.content ?? "", lastUpdated: saved.lastUpdated ?? note.lastUpdated };
      }
      return { ...note, children: await mergeContent(note.children, filenames) };
    })
  );
}

async function splitContent(notes: Note[], filenames: Map<string, string>) {
  for (const note of notes) {
    if (note.type === "note") {
      const fname = filenames.get(note.id);
      if (fname) {
        await writeNoteContent(fname, note.content, note.lastUpdated);
      }
    }
    await splitContent(note.children, filenames);
  }
}

async function cleanOrphanedFiles(active: Set<string>) {
  try {
    const files = await fs.readdir(NOTES_DIR);
    for (const file of files) {
      if (!active.has(file)) {
        await fs.rm(path.join(NOTES_DIR, file), { force: true });
      }
    }
  } catch {
    // notes dir doesn't exist yet
  }
}

async function migrateFromOldFormat(): Promise<Note[]> {
  try {
    const raw = await fs.readFile(OLD_DATA_FILE, "utf-8");
    const notes = JSON.parse(raw) as Note[];
    const filenames = assignFilenames(notes);
    await splitContent(notes, filenames);
    await writeTree(notes);
    await fs.rm(OLD_DATA_FILE);
    return notes;
  } catch {
    throw new Error("no old data");
  }
}

async function migrateToTitleFilenames(notes: Note[], filenames: Map<string, string>) {
  for (const [id, fname] of filenames) {
    const oldPath = path.join(NOTES_DIR, `${id}.json`);
    const newPath = path.join(NOTES_DIR, fname);
    try {
      await fs.access(newPath);
    } catch {
      try {
        await fs.rename(oldPath, newPath);
      } catch {
        // old file doesn't exist either, ignore
      }
    }
  }
}

async function readNotes(): Promise<Note[]> {
  await ensureDirs();
  try {
    const notes = await readTree();
    const filenames = assignFilenames(notes);
    await migrateToTitleFilenames(notes, filenames);
    return mergeContent(notes, filenames);
  } catch {
    try {
      return migrateFromOldFormat();
    } catch {
      await writeNotes(SEED_NOTES);
      return SEED_NOTES;
    }
  }
}

async function writeNotes(notes: Note[]) {
  const filenames = assignFilenames(notes);
  await splitContent(notes, filenames);
  await writeTree(notes);
  await cleanOrphanedFiles(new Set(filenames.values()));
}

export async function GET() {
  const notes = await readNotes();
  return NextResponse.json(notes);
}

export async function PUT(request: Request) {
  const notes = (await request.json()) as Note[];
  await writeNotes(notes);
  return NextResponse.json({ ok: true });
}
