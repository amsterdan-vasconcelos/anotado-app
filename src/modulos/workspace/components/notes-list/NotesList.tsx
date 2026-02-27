import { FileQuestion } from "lucide-react";
import { NoteCard } from "./NoteCard";

interface Note {
  slug: string;
  title: string;
  category: string;
  date: string;
}

interface NotesListProps {
  notes: Note[];
  owner: string;
  workspace: string;
}

export function NotesList({ notes, owner, workspace }: NotesListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card text-card-foreground border border-border rounded-xl shadow-xs text-center">
        <FileQuestion size={48} className="text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-foreground">
          Nenhuma nota encontrada
        </h2>
        <p className="text-muted-foreground">
          Este workspace ainda não possui anotações.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note) => (
        <NoteCard
          key={`${note.category}-${note.slug}`}
          note={note}
          owner={owner}
          workspace={workspace}
        />
      ))}
    </div>
  );
}
