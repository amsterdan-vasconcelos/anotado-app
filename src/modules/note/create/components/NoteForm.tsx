"use client";

import { Loader2, Save } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TipTapEditor } from "@/modules/editor/components/TipTapEditor";
import { MODE_CONFIG as BASE_MODE_CONFIG } from "@/modules/note/components/LeftSidebar";
import { CategorySelector } from "./CategorySelector";

const FORM_EXTRAS = {
  create: {
    badgeLabel: "Novo",
    sidebarTitle: "Nova Nota",
    sidebarDesc: "Preencha as informações para criar uma nova anotação.",
    saveLabel: "Criar Nota",
    badgeBg:
      "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    editorRing:
      "focus-within:ring-emerald-400/40 focus-within:border-emerald-400",
  },
  edit: {
    badgeLabel: "Edição",
    sidebarTitle: "Editar Nota",
    sidebarDesc: "Atualize as informações da sua anotação.",
    saveLabel: "Salvar Nota",
    badgeBg:
      "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    editorRing: "focus-within:ring-amber-400/40 focus-within:border-amber-400",
  },
} as const;

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
  error?: string | null;
}

export function NoteForm({
  mode,
  categories,
  initialData,
  onSubmit,
  isLoading,
  error,
}: NoteFormProps) {
  const base = BASE_MODE_CONFIG[mode];
  const extras = FORM_EXTRAS[mode];

  const cfg = {
    Icon: base.Icon,
    topBarBg: base.topBarBg,
    topBarText: base.topBarText,
    topBarLabel: base.topBarLabel,
    sidebarBg: base.leftSidebarBg,
    sidebarIconColor: base.leftSidebarIcon,
    badgeBg: extras.badgeBg,
    badgeLabel: extras.badgeLabel,
    sidebarTitle: extras.sidebarTitle,
    sidebarDesc: extras.sidebarDesc,
    saveLabel: extras.saveLabel,
    editorRing: extras.editorRing,
  } as const;
  const ModeIcon = cfg.Icon;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [category, setCategory] = useState(
    initialData?.category ?? categories[0] ?? "geral",
  );

  const contentRef = useRef(initialData?.content ?? "");

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    onSubmit({ title, category, content: contentRef.current });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-muted/30 flex justify-center py-12 px-6">
        <div className="w-full max-w-3xl bg-card rounded-2xl shadow-md ring-1 ring-border/60 min-h-full">
          <TipTapEditor
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

      <aside className="w-72 shrink-0 flex flex-col border-l border-border bg-card overflow-y-auto">
        <div className="p-6 flex flex-col gap-6 flex-1">
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

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

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
    </form>
  );
}
