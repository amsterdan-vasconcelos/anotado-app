"use client";

import { Plus, Tags } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CategoryManagerModal } from "./CategoryManagerModal";
import { DeleteWorkspaceModal } from "./DeleteWorkspaceModal";
import { ShareWorkspaceModal } from "./ShareWorkspaceModal";
import { WorkspaceActionsMenu } from "./WorkspaceActionsMenu";

interface WorkspaceHeaderActionsProps {
  owner: string;
  workspaceSlug: string;
}

export function WorkspaceHeaderActions({
  owner,
  workspaceSlug,
}: WorkspaceHeaderActionsProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setIsCategoryModalOpen(true)}
        >
          <Tags size={16} />
          Categorias
        </Button>

        <WorkspaceActionsMenu
          onShareClick={() => setIsShareModalOpen(true)}
          onDeleteClick={() => setIsDeleteAlertOpen(true)}
        />

        <Link
          href={`/note/create?owner=${owner}&workspace=${workspaceSlug}`}
          className={cn(buttonVariants({ variant: "default", size: "lg" }))}
        >
          <Plus size={16} />
          Nova Nota
        </Link>
      </div>

      {isShareModalOpen && (
        <ShareWorkspaceModal
          owner={owner}
          workspace={workspaceSlug}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {isDeleteAlertOpen && (
        <DeleteWorkspaceModal
          owner={owner}
          workspace={workspaceSlug}
          onClose={() => setIsDeleteAlertOpen(false)}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryManagerModal
          owner={owner}
          workspace={workspaceSlug}
          onClose={() => setIsCategoryModalOpen(false)}
        />
      )}
    </>
  );
}
