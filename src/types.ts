export type NoteType = "folder" | "note";

export interface Note {
  id: string;
  title: string;
  type: NoteType;
  content?: string;
  children: Note[];
  isExpanded?: boolean;
  lastUpdated?: string;
}
