import { Eye } from "lucide-react";

interface NoteTopBarProps {
  initialTitle: string;
  category: string;
}

export function NoteTopBar({ initialTitle, category }: NoteTopBarProps) {
  return (
    <div className="shrink-0 flex items-center gap-2.5 px-5 h-9 border-b bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800">
      <Eye size={13} className="text-sky-600 dark:text-sky-400" />
      <span className="text-xs font-semibold tracking-wide text-sky-700 dark:text-sky-300">
        Leitura
      </span>
      <span className="text-xs text-muted-foreground/60">·</span>
      <span className="text-xs text-muted-foreground truncate max-w-xs">
        {initialTitle}
      </span>
      <span className="text-xs text-muted-foreground/60">·</span>
      <span className="text-xs text-muted-foreground/70">{category}</span>
    </div>
  );
}
