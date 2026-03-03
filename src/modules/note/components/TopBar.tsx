import { Eye, FilePlus2, PenLine } from "lucide-react";

const MODE_CONFIG = {
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

type TopBar = {
  mode: "view" | "create" | "edit";
};

const TopBar = ({ mode }: TopBar) => {
  const cfg = MODE_CONFIG[mode];
  const ModeIcon = cfg.Icon;

  return (
    <div
      className={`shrink-0 flex items-center gap-2.5 px-5 h-9 border-b ${cfg.topBarBg}`}
    >
      <ModeIcon size={13} className={cfg.topBarText} />
      <span className={`text-xs font-semibold tracking-wide ${cfg.topBarText}`}>
        {cfg.topBarLabel}
      </span>
    </div>
  );
};

export { TopBar };
