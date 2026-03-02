"use client";

import { ArrowLeft, FilePlus2, Loader2, PenLine, Save } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TipTapEditor } from "@/modules/editor/components/TipTapEditor";
import { CategorySelector } from "./CategorySelector";

// ─── Mode configuration ──────────────────────────────────────────────────────
const MODE_CONFIG = {
  create: {
    Icon: FilePlus2,
    topBarBg:
      "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    topBarText: "text-emerald-700 dark:text-emerald-300",
    topBarLabel: "Nova Nota",
    sidebarBg:
      "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900",
    sidebarIconColor: "text-emerald-600 dark:text-emerald-400",
    badgeBg:
      "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    badgeLabel: "Novo",
    sidebarTitle: "Nova Nota",
    sidebarDesc: "Preencha as informações para criar uma nova anotação.",
    saveLabel: "Criar Nota",
    editorRing:
      "focus-within:ring-emerald-400/40 focus-within:border-emerald-400",
  },
  edit: {
    Icon: PenLine,
    topBarBg:
      "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    topBarText: "text-amber-700 dark:text-amber-300",
    topBarLabel: "Editando Nota",
    sidebarBg:
      "bg-amber-50/60 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900",
    sidebarIconColor: "text-amber-600 dark:text-amber-400",
    badgeBg:
      "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    badgeLabel: "Edição",
    sidebarTitle: "Editar Nota",
    sidebarDesc: "Atualize as informações da sua anotação.",
    saveLabel: "Salvar Nota",
    editorRing: "focus-within:ring-amber-400/40 focus-within:border-amber-400",
  },
} as const;

// ─── Props ───────────────────────────────────────────────────────────────────
interface NoteFormProps {
  mode: "create" | "edit";
  categories: string[];
  initialData?: {
    title: string;
    category: string;
    content: string;
  };
  onSubmit: (data: {
    title: string;
    category: string;
    content: string;
  }) => void;
  isLoading: boolean;
  onCancel: () => void;
  error?: string | null;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function NoteForm({
  mode,
  categories,
  initialData,
  onSubmit,
  isLoading,
  onCancel,
  error,
}: NoteFormProps) {
  const cfg = MODE_CONFIG[mode];
  const ModeIcon = cfg.Icon;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [category, setCategory] = useState(
    initialData?.category ?? categories[0] ?? "geral",
  );

  // ─── Content is stored in a ref, NOT in state.
  // This means keystrokes never trigger a React re-render of NoteForm,
  // eliminating the main source of editor lag / mouse-freeze.
  const contentRef = useRef(initialData?.content ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ title, category, content: contentRef.current });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-screen overflow-hidden bg-background"
    >
      {/* ── Top mode bar ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          "shrink-0 flex items-center gap-2.5 px-5 h-9 border-b",
          cfg.topBarBg,
        )}
      >
        <ModeIcon size={13} className={cfg.topBarText} />
        <span
          className={cn("text-xs font-semibold tracking-wide", cfg.topBarText)}
        >
          {cfg.topBarLabel}
        </span>
        {title && (
          <>
            <span className="text-xs text-muted-foreground/60">·</span>
            <span className="text-xs text-muted-foreground truncate max-w-xs">
              {title}
            </span>
          </>
        )}
      </div>

      {/* ── Three-column layout ──────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left sidebar — back button + mode indicator ────────────────── */}
        <aside
          className={cn(
            "w-14 shrink-0 flex flex-col items-center pt-6 gap-4 border-r",
            cfg.sidebarBg,
          )}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            title="Voltar"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Mode icon pill */}
          <div
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg",
              cfg.sidebarIconColor,
            )}
            title={cfg.topBarLabel}
          >
            <ModeIcon size={16} />
            <span
              className="text-[9px] font-bold tracking-widest uppercase"
              style={{ writingMode: "vertical-rl" }}
            >
              {cfg.badgeLabel}
            </span>
          </div>
        </aside>

        {/* ── Main — writing area ───────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-muted/30 flex justify-center py-12 px-6">
          <div className="w-full max-w-3xl bg-card rounded-2xl shadow-md ring-1 ring-border/60 min-h-full">
            <TipTapEditor
              // Initial value only — editor manages its own content internally.
              // Updates flow out via onChange → contentRef (no state update).
              value={initialData?.content ?? ""}
              onChange={(val) => {
                contentRef.current = val;
              }}
              placeholder="Comece a escrever… use / para inserir elementos"
              className={cn(
                "relative h-full border border-border rounded-2xl",
                "transition-colors",
                cfg.editorRing,
              )}
              contentClassName="outline-none min-h-[calc(100vh-8rem)] prose prose-sm max-w-none px-10 py-10 focus:outline-none"
            />
          </div>
        </main>

        {/* ── Right sidebar — metadata ──────────────────────────────────── */}
        <aside className="w-72 shrink-0 flex flex-col border-l border-border bg-card overflow-y-auto">
          <div className="p-6 flex flex-col gap-6 flex-1">
            {/* Sidebar header */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "p-1.5 rounded-lg",
                    mode === "create"
                      ? "bg-emerald-100 dark:bg-emerald-900/50"
                      : "bg-amber-100 dark:bg-amber-900/50",
                  )}
                >
                  <ModeIcon size={14} className={cfg.sidebarIconColor} />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  {cfg.sidebarTitle}
                </h2>
                <span
                  className={cn(
                    "ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full",
                    cfg.badgeBg,
                  )}
                >
                  {cfg.badgeLabel}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{cfg.sidebarDesc}</p>
            </div>

            <Separator />

            {/* Metadata fields */}
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="note-title">Título</Label>
                <Input
                  id="note-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Ex: Introdução ao Next.js"
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="note-category">Categoria</Label>
                <CategorySelector
                  id="note-category"
                  categories={categories}
                  value={category}
                  onChange={setCategory}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            {/* Save button pinned to bottom */}
            <div className="mt-auto pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={isLoading || !title.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {isLoading ? "Salvando..." : cfg.saveLabel}
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
