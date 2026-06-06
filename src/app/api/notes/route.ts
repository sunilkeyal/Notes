import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { Note } from "@/types";
import { SEED_NOTES } from "@/lib/seed";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "notes.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // dir already exists
  }
}

async function readNotes(): Promise<Note[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Note[];
  } catch {
    await writeNotes(SEED_NOTES);
    return SEED_NOTES;
  }
}

async function writeNotes(notes: Note[]) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(notes, null, 2), "utf-8");
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
