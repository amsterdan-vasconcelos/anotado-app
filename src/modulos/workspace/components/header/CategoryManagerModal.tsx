"use client";

import { Check, Edit2, Loader2, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  apiAddCategory,
  apiDeleteCategory,
  apiFetchCategories,
  apiRenameCategory,
} from "@/lib/api-client";

interface CategoryManagerModalProps {
  owner: string;
  workspace: string;
  onClose: () => void;
}

export function CategoryManagerModal({
  owner,
  workspace,
  onClose,
}: CategoryManagerModalProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Estado para nova categoria
  const [newCategoryValue, setNewCategoryValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      const result = await apiFetchCategories(owner, workspace);

      if (result.success) {
        setCategories(result.data);
      } else {
        setFetchError(result.error);
      }

      setIsLoading(false);
    }

    fetchCategories();
  }, [owner, workspace]);

  function startEditing(category: string) {
    setEditingCategory(category);
    setEditValue(category);
    setActionError(null);
  }

  async function handleSaveEdit(oldCategory: string) {
    if (!editValue.trim() || editValue === oldCategory) {
      setEditingCategory(null);
      return;
    }

    const newCategory = editValue
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "");

    setIsProcessing(true);
    setActionError(null);

    const result = await apiRenameCategory({
      owner,
      workspace,
      oldCategory,
      newCategory,
    });

    if (result.success) {
      setCategories((prev) =>
        prev.map((c) => (c === oldCategory ? newCategory : c)),
      );
      setEditingCategory(null);
      router.refresh();
    } else {
      setActionError(result.error);
    }

    setIsProcessing(false);
  }

  async function handleDelete(category: string) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a categoria "${category}"? TODAS as notas dentro dela serão apagadas. Esta ação não tem volta.`,
    );

    if (!confirmed) return;

    setIsProcessing(true);
    setActionError(null);

    const result = await apiDeleteCategory(owner, workspace, category);

    if (result.success) {
      setCategories((prev) => prev.filter((c) => c !== category));
      router.refresh();
    } else {
      setActionError(result.error);
    }

    setIsProcessing(false);
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();

    const slug = newCategoryValue
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    if (!slug) return;

    setIsAdding(true);
    setAddError(null);

    const result = await apiAddCategory(owner, workspace, slug);

    if (result.success) {
      setCategories((prev) => [...prev, slug]);
      setNewCategoryValue("");
      router.refresh();
    } else {
      setAddError(result.error);
    }

    setIsAdding(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-border flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/50 shrink-0">
          <h2 className="text-base font-semibold text-foreground">
            Gerenciar Categorias
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            disabled={isProcessing || isAdding}
          >
            <X size={16} />
          </Button>
        </div>

        {/* Formulário de nova categoria */}
        <div className="p-4 border-b border-border shrink-0">
          <form onSubmit={handleAddCategory} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                type="text"
                value={newCategoryValue}
                onChange={(e) => setNewCategoryValue(e.target.value)}
                placeholder="Nome da nova categoria..."
                disabled={isAdding || isProcessing}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isAdding || !newCategoryValue.trim() || isProcessing}
              >
                {isAdding ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                Adicionar
              </Button>
            </div>
            {addError && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {addError}
              </p>
            )}
          </form>
        </div>

        {/* Lista de categorias */}
        <div className="p-4 overflow-y-auto flex flex-col gap-3">
          {actionError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
              {actionError}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          ) : fetchError ? (
            <p className="text-destructive text-sm text-center py-4">
              {fetchError}
            </p>
          ) : categories.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Nenhuma categoria encontrada.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {categories.map((category) => (
                <li
                  key={category}
                  className="flex items-center justify-between bg-muted/40 border border-border p-3 rounded-lg"
                >
                  {editingCategory === category ? (
                    <div className="flex items-center gap-2 w-full">
                      <Input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        disabled={isProcessing}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleSaveEdit(category)}
                        disabled={isProcessing || !editValue.trim()}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        {isProcessing ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditingCategory(null)}
                        disabled={isProcessing}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-foreground">
                        {category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => startEditing(category)}
                          disabled={isProcessing || category === "geral"}
                          title={
                            category === "geral"
                              ? "A categoria padrão não pode ser editada"
                              : "Renomear categoria"
                          }
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(category)}
                          disabled={isProcessing || category === "geral"}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-30"
                          title={
                            category === "geral"
                              ? "A categoria padrão não pode ser excluída"
                              : "Excluir categoria e todas as notas"
                          }
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
