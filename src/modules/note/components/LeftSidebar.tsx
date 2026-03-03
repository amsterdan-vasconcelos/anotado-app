import { Eye, FilePlus2, PenLine } from "lucide-react";

// shared configuration used by both left and right sidebars (and potentially other
// layout elements) so that all panels for a given mode use a consistent color
// palette. exporting the constant allows other modules to reference the same
// values instead of duplicating them.
export const MODE_CONFIG = {
  view: {
    Icon: Eye,
    topBarBg: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
    topBarText: "text-sky-600 dark:text-sky-400",
    topBarLabel: "Leitura",
    leftSidebarBg:
      "bg-sky-50/60 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900",
    leftSidebarIcon: "text-sky-600 dark:text-sky-400",
    leftSidebarLabel: "Lendo",
  },
  create: {
    Icon: FilePlus2,
    topBarBg:
      "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    topBarText: "text-emerald-700 dark:text-emerald-300",
    topBarLabel: "Nova Nota",
    leftSidebarBg:
      "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900",
    leftSidebarIcon: "text-emerald-600 dark:text-emerald-400",
    leftSidebarLabel: "Novo",
  },
  edit: {
    Icon: PenLine,
    topBarBg:
      "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    topBarText: "text-amber-700 dark:text-amber-300",
    topBarLabel: "Editando Nota",
    leftSidebarBg:
      "bg-amber-50/60 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900",
    leftSidebarIcon: "text-amber-600 dark:text-amber-400",
    leftSidebarLabel: "Edição",
  },
} as const;

type LeftSidebar = {
  mode: "view" | "create" | "edit";
  owner: string;
  workspace: string;
};

const LeftSidebar = ({ mode, owner, workspace }: LeftSidebar) => {
  const cfg = MODE_CONFIG[mode];
  const ModeIcon = cfg.Icon;

  return (
    <aside
      className={`w-14 shrink-0 flex flex-col items-center pt-6 gap-4 border-r ${cfg.leftSidebarBg}`}
    >
      <a
        href={`/workspaces/unit?owner=${owner}&workspace=${workspace}`}
        title="Voltar ao workspace"
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        {/* Back icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label="Voltar"
        >
          <title>Voltar</title>
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </a>

      {/* Mode indicator */}
      <div
        className={`flex flex-col items-center gap-1 p-2 rounded-lg ${cfg.leftSidebarIcon}`}
        title={cfg.topBarLabel}
      >
        <ModeIcon size={16} />
        <span
          className="text-[9px] font-bold tracking-widest uppercase"
          style={{ writingMode: "vertical-rl" }}
        >
          {cfg.leftSidebarLabel}
        </span>
      </div>
    </aside>
  );
};

export { LeftSidebar };
