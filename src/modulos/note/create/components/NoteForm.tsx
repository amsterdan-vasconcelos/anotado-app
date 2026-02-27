"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TipTapEditor } from "@/modulos/editor/components/TiptapEditor";
import { CategorySelector } from "./CategorySelector";

interface NoteFormProps {
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

export function NoteForm({
  categories,
  initialData,
  onSubmit,
  isLoading,
  onCancel,
  error,
}: NoteFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(
    initialData?.category || categories[0] || "geral",
  );
  const [content, setContent] = useState(initialData?.content || "");

  const isEditing = !!initialData;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ title, category, content });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-screen overflow-hidden bg-background"
    >
      {/* Coluna esquerda — botão voltar */}
      <aside className="w-14 shrink-0 flex flex-col items-center pt-6 border-r border-border bg-card">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          title="Voltar"
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={20} />
        </button>
      </aside>

      {/* Coluna central — papel de escrita */}
      <main className="flex-1 overflow-y-auto bg-muted/30 flex justify-center py-12 px-6">
        <div className="w-full max-w-3xl bg-card rounded-2xl shadow-md ring-1 ring-border/60 min-h-full">
          <TipTapEditor
            value={content}
            onChange={setContent}
            placeholder="Comece a escrever… use / para inserir elementos"
            className="relative h-full"
            contentClassName="outline-none min-h-[calc(100vh-8rem)] prose prose-sm max-w-none px-10 py-10 focus:outline-none"
          />
        </div>
      </main>

      {/* Coluna direita — sidebar de metadados */}
      <aside className="w-72 shrink-0 flex flex-col border-l border-border bg-card overflow-y-auto">
        <div className="p-6 flex flex-col gap-6 flex-1">
          {/* Cabeçalho da sidebar */}
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isEditing ? "Editar Nota" : "Nova Nota"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {isEditing
                ? "Atualize as informações da sua anotação."
                : "Preencha as informações para criar uma nova anotação."}
            </p>
          </div>

          <Separator />

          {/* Campos de metadados */}
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

          {/* Erro */}
          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {/* Botão salvar no fundo */}
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
              {isLoading ? "Salvando..." : "Salvar Nota"}
            </Button>
          </div>
        </div>
      </aside>
    </form>
  );
}
