"use client";

import { Clock, GitCommit } from "lucide-react";
import Image from "next/image";
// React is not required explicitly anymore; the file is purely functional and only
// uses JSX which is handled by the compiler.
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CommitRecord } from "@/modules/note/actions/fetchHistory";

// bring in the shared mode configuration so that the right sidebar uses the
// exact same background/border classes as the left sidebar. this keeps the
// colour scheme consistent across all panels.
import { MODE_CONFIG } from "@/modules/note/components/LeftSidebar";

// small palette mapping used specifically for the right/metadata sidebar so
// its header matches the look-and-feel of the create/edit sidebars.
const SIDEBAR_STYLE: Record<
  "view" | "create" | "edit",
  { iconBg: string; iconColor: string; badgeBg: string }
> = {
  view: {
    iconBg: "bg-sky-100 dark:bg-sky-900/50",
    iconColor: "text-sky-600 dark:text-sky-400",
    badgeBg: "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300",
  },
  create: {
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badgeBg:
      "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
  },
  edit: {
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
    badgeBg:
      "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
  },
};

// simplified, non-collapsible sidebar. the previous iterations exposed a
// toggle button and managed an "open" state; in practice that behaviour was
// only used on the view page, and it made the panel feel disconnected from the
// rest of the layout (different background colour, extra interactive affordance).
//
// the senior‑level decision is to treat the right sidebar as just another
// layout panel: it should be present when the route needs it, should share the
// colour palette of the current mode, and should not collapse by default. the
// component remains lightweight and entirely client‑free.
export function NoteSidebar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  // Use the same base container classes used by the create/edit form so the
  // panel background, border and scroll behaviour match exactly.
  return (
    <aside
      className={cn(
        "w-72 shrink-0 flex flex-col border-l border-border bg-card overflow-y-auto",
        className,
      )}
    >
      {children}
    </aside>
  );
}

// the toggle and translucent content helpers are no longer required; children
// are always visible. we keep some lightweight wrapper components for
// consistency with existing markup in viewer pages, but they are mere
// pass‑throughs.
export function NoteSidebarContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col min-h-0 flex-1", className)}>
      {children}
    </div>
  );
}

export function NoteSidebarHeader({
  mode,
  title,
  category,
  className,
}: {
  mode: "view" | "create" | "edit";
  title: string;
  category: string;
  className?: string;
}) {
  const cfg = MODE_CONFIG[mode];
  const ModeIcon = cfg.Icon;
  const style = SIDEBAR_STYLE[mode];

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <div className={cn("p-1.5 rounded-lg", style.iconBg)}>
          <ModeIcon size={14} className={style.iconColor} />
        </div>

        <h2 className="text-base font-semibold text-foreground">{title}</h2>

        <span
          className={cn(
            "ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full",
            style.badgeBg,
          )}
        >
          {category}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Categoria: {category}
      </p>
    </div>
  );
}

export function NoteSidebarSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-2", className)}>{children}</div>;
}

export function NoteSidebarHistoryHeader({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 font-semibold text-foreground",
        className,
      )}
    >
      <Clock size={14} className="text-primary" />
      Histórico de Versões
    </div>
  );
}

export function NoteSidebarHistoryList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function NoteSidebarHistoryItem({
  commit,
  isActive,
  isLatest,
  onClick,
}: {
  commit: CommitRecord;
  isActive: boolean;
  isLatest: boolean;
  onClick: () => void;
}) {
  const date = new Date(commit.date).toLocaleString("pt-BR");

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left p-3 rounded-lg border transition-all w-full",
        isActive
          ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
          : "border-border hover:border-border/80 hover:bg-muted/50",
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-medium text-foreground text-xs truncate">
          {commit.message}
        </span>
        {isLatest && (
          <Badge variant="default" className="shrink-0 text-[10px]">
            HEAD
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1.5 mb-1.5">
        {commit.authorAvatar ? (
          <Image
            src={commit.authorAvatar}
            alt={commit.authorName}
            width={16}
            height={16}
            className="rounded-full shrink-0"
          />
        ) : (
          <div className="w-4 h-4 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
            <span className="text-muted-foreground font-bold text-[8px]">
              {commit.authorName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="text-muted-foreground text-xs truncate">
          {commit.authorName}
        </span>
      </div>

      <div className="flex items-center gap-1 text-muted-foreground text-[10px]">
        <GitCommit size={10} />
        <span className="font-mono">{commit.sha.substring(0, 7)}</span>
        <span className="mx-0.5">·</span>
        <span>{date}</span>
      </div>
    </button>
  );
}
