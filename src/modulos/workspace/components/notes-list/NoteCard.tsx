import { Calendar, FileText, Tag } from "lucide-react";

import { AppCard } from "@/components/app-card";
import { Badge } from "@/components/ui/badge";

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
  const href = `/note?owner=${owner}&workspace=${workspace}&category=${note.category}&slug=${note.slug}`;

  return (
    <AppCard variant="note" href={href}>
      <AppCard.Header>
        <AppCard.Title>{note.title}</AppCard.Title>
        <FileText
          size={18}
          className="shrink-0 text-muted-foreground transition-colors group-hover/card:text-primary"
        />
      </AppCard.Header>

      <AppCard.Footer>
        <Badge variant="secondary" className="gap-1">
          <Tag size={11} />
          {note.category}
        </Badge>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar size={12} />
          <span>{formattedDate}</span>
        </div>
      </AppCard.Footer>
    </AppCard>
  );
}
