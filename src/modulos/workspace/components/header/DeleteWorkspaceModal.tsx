"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiDeleteWorkspace } from "@/lib/api-client";

interface DeleteWorkspaceModalProps {
  owner: string;
  workspace: string;
  onClose: () => void;
}

export function DeleteWorkspaceModal({
  owner,
  workspace,
  onClose,
}: DeleteWorkspaceModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    const result = await apiDeleteWorkspace(owner, workspace);

    if (!result.success) {
      setError(result.error);
      setIsDeleting(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-border">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-destructive/10 text-destructive p-2 rounded-lg">
              <AlertTriangle size={20} />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Excluir Workspace?
            </h2>
          </div>

          <p className="text-muted-foreground text-sm mb-6">
            Você tem certeza que deseja excluir o workspace{" "}
            <span className="font-semibold text-foreground">"{workspace}"</span>
            ? Esta ação apagará todas as notas, categorias e configurações
            permanentemente. Esta ação não pode ser desfeita.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 size={14} className="animate-spin" />}
              {isDeleting ? "Excluindo..." : "Sim, Excluir"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
