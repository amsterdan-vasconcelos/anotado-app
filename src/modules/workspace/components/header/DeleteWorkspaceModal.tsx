"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteWorkspace } from "@/modules/workspace/actions/deleteWorkspace";

interface DeleteWorkspaceModalProps {
  owner: string;
  workspace: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteWorkspaceModal({
  owner,
  workspace,
  open,
  onOpenChange,
}: DeleteWorkspaceModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    const result = await deleteWorkspace(owner, workspace);

    if (!result.success) {
      setError(result.error);
      setIsDeleting(false);
      return;
    }

    onOpenChange(false);
    router.push("/workspaces");
    router.refresh();
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <AlertTriangle />
          </AlertDialogMedia>

          <AlertDialogTitle>Excluir Workspace?</AlertDialogTitle>

          <AlertDialogDescription>
            Você tem certeza que deseja excluir o workspace{" "}
            <strong className="text-foreground font-semibold">
              "{workspace}"
            </strong>
            ? Esta ação apagará todas as notas, categorias e configurações
            permanentemente e não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting && <Loader2 size={14} className="animate-spin" />}
            {isDeleting ? "Excluindo..." : "Sim, Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
