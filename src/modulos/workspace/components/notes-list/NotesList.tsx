import { FileQuestion } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <CardContent className="flex flex-col items-center gap-4 px-0">
          <FileQuestion size={48} className="text-muted-foreground/40" />
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">
              Nenhuma nota encontrada
            </h2>
            <p className="text-muted-foreground text-sm">
              Este workspace ainda não possui anotações.
            </p>
          </div>
        </CardContent>
      </Card>
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
