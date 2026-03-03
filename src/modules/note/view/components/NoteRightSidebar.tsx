"use client";

import {
  Clock,
  GitCommit,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CommitRecord } from "@/modules/note/actions/fetchHistory";

const NoteSidebarContext = React.createContext<{
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export function NoteSidebar({
  open,
  onOpenChange,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <NoteSidebarContext.Provider value={{ open, onOpenChange }}>
      <aside
        className={cn(
          "shrink-0 flex flex-col border-l border-border bg-card overflow-hidden transition-[width] duration-200 ease-in-out",
          open ? "w-72" : "w-14",
          className,
        )}
      >
        {children}
      </aside>
    </NoteSidebarContext.Provider>
  );
}

export function NoteSidebarToggle({ className }: { className?: string }) {
  const context = React.useContext(NoteSidebarContext);
  if (!context) throw new Error("Missing NoteSidebarContext");

  return (
    <div
      className={cn(
        "pt-6 shrink-0 flex",
        context.open ? "px-6 justify-end" : "justify-center",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => context.onOpenChange((v) => !v)}
        title={context.open ? "Fechar painel" : "Abrir painel"}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        {context.open ? (
          <PanelRightClose size={20} />
        ) : (
          <PanelRightOpen size={20} />
        )}
      </button>
    </div>
  );
}

export function NoteSidebarContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(NoteSidebarContext);
  if (!context) throw new Error("Missing NoteSidebarContext");

  return (
    <div
      className={cn(
        "flex flex-col min-h-0 flex-1 transition-opacity duration-150",
        context.open ? "opacity-100" : "opacity-0 pointer-events-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function NoteSidebarHeader({
  title,
  category,
  className,
}: {
  title: string;
  category: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="text-base font-semibold text-foreground leading-snug">
        {title}
      </h2>
      <div className="mt-2">
        <Badge variant="secondary">{category}</Badge>
      </div>
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
