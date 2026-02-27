import { Calendar, FileText, Tag } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Note {
  slug: string;
  title: string;
  category: string;
  date: string;
}

interface NoteCardProps {
  note: Note;
  owner: string;
  workspace: string;
}

export function NoteCard({ note, owner, workspace }: NoteCardProps) {
  const formattedDate = new Date(note.date).toLocaleDateString("pt-BR");

  return (
    <Link
      href={`/note?owner=${owner}&workspace=${workspace}&category=${note.category}&slug=${note.slug}`}
      className={cn(
        "flex flex-col gap-3 bg-card text-card-foreground p-5 border border-border rounded-xl shadow-xs",
        "hover:shadow-md hover:border-primary/50 transition-all group",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-base text-foreground line-clamp-2 leading-snug">
          {note.title}
        </h3>
        <FileText
          size={18}
          className="text-muted-foreground shrink-0 group-hover:text-primary transition-colors"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-auto">
        <Badge variant="secondary" className="gap-1">
          <Tag size={11} />
          {note.category}
        </Badge>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar size={12} />
          <span>{formattedDate}</span>
        </div>
      </div>
    </Link>
  );
}
