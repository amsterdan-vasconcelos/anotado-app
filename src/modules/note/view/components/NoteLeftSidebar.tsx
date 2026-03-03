import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

interface NoteLeftSidebarProps {
  owner: string;
  workspace: string;
}

export function NoteLeftSidebar({ owner, workspace }: NoteLeftSidebarProps) {
  return (
    <aside className="w-14 shrink-0 flex flex-col items-center pt-6 gap-4 border-r bg-sky-50/60 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900">
      <Link
        href={`/workspaces/unit?owner=${owner}&workspace=${workspace}`}
        title="Voltar ao workspace"
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <ArrowLeft size={20} />
      </Link>

      <div
        className="flex flex-col items-center gap-1 p-2 rounded-lg text-sky-600 dark:text-sky-400"
        title="Modo Leitura"
      >
        <BookOpen size={16} />
        <span
          className="text-[9px] font-bold tracking-widest uppercase text-sky-600 dark:text-sky-400"
          style={{ writingMode: "vertical-rl" }}
        >
          Lendo
        </span>
      </div>
    </aside>
  );
}
