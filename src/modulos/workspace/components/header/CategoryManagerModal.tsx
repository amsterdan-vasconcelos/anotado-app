"use client";

import {
  AlertTriangle,
  Check,
  Edit2,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createCategory } from "@/modulos/category/actions/createCategory";
import { deleteCategory } from "@/modulos/category/actions/deleteCategory";
import { fetchCategories } from "@/modulos/category/actions/fetchCategories";
import { renameCategory } from "@/modulos/category/actions/renameCategory";

interface CategoryManagerModalProps {
  owner: string;
  workspace: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryManagerModal({
  owner,
  workspace,
  open,
  onOpenChange,
}: CategoryManagerModalProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [newCategoryValue, setNewCategoryValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    async function loadCategories() {
      setIsLoading(true);
      setFetchError(null);
      const result = await fetchCategories(owner, workspace);
      if (result.success) {
        setCategories(result.data);
      } else {
        setFetchError(result.error);
      }
      setIsLoading(false);
    }

    loadCategories();
  }, [open, owner, workspace]);

  function startEditing(category: string) {
    setEditingCategory(category);
    setEditValue(category);
    setActionError(null);
  }

  async function handleSaveEdit(oldCategory: string) {
    const newCategory = editValue
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "");

    if (!newCategory || newCategory === oldCategory) {
      setEditingCategory(null);
      return;
    }

    setIsProcessing(true);
    setActionError(null);

    const result = await renameCategory({
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
    setIsProcessing(true);
    setActionError(null);
    setCategoryToDelete(null);

    const result = await deleteCategory(owner, workspace, category);

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

    const result = await createCategory(owner, workspace, slug);

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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex max-h-[80vh] w-full max-w-lg flex-col gap-0 overflow-hidden p-0"
          showCloseButton={false}
        >
          {/* Header */}
          <DialogHeader className="shrink-0 border-b border-border bg-muted/50 px-4 py-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base">
                Gerenciar Categorias
              </DialogTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing || isAdding}
              >
                <X size={16} />
              </Button>
            </div>
          </DialogHeader>

          {/* Formulário nova categoria */}
          <div className="shrink-0 border-b border-border p-4">
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
                  disabled={
                    isAdding || !newCategoryValue.trim() || isProcessing
                  }
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
                <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {addError}
                </p>
              )}
            </form>
          </div>

          {/* Lista de categorias */}
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-3 p-4">
              {actionError && (
                <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {actionError}
                </p>
              )}

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-primary" size={28} />
                </div>
              ) : fetchError ? (
                <p className="py-4 text-center text-sm text-destructive">
                  {fetchError}
                </p>
              ) : categories.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nenhuma categoria encontrada.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {categories.map((category) => (
                    <li
                      key={category}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3"
                    >
                      {editingCategory === category ? (
                        <div className="flex w-full items-center gap-2">
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
                            className="text-green-600 hover:bg-green-50 hover:text-green-700"
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
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
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
                              onClick={() => setCategoryToDelete(category)}
                              disabled={isProcessing || category === "geral"}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
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
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2 text-destructive shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                <AlertDialogDescription className="mt-1">
                  Todas as notas em{" "}
                  <strong className="text-foreground">
                    "{categoryToDelete}"
                  </strong>{" "}
                  serão apagadas permanentemente. Esta ação não pode ser
                  desfeita.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => categoryToDelete && handleDelete(categoryToDelete)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
