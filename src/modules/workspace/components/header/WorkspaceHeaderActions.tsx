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
  const [shareOpen, setShareOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setCategoryOpen(true)}
        >
          <Tags size={16} />
          Categorias
        </Button>

        <WorkspaceActionsMenu
          onShareClick={() => setShareOpen(true)}
          onDeleteClick={() => setDeleteOpen(true)}
        />

        <Link
          href={`/note/create?owner=${owner}&workspace=${workspaceSlug}`}
          className={cn(buttonVariants({ variant: "default", size: "lg" }))}
        >
          <Plus size={16} />
          Nova Nota
        </Link>
      </div>

      <CategoryManagerModal
        owner={owner}
        workspace={workspaceSlug}
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
      />

      <ShareWorkspaceModal
        owner={owner}
        workspace={workspaceSlug}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />

      <DeleteWorkspaceModal
        owner={owner}
        workspace={workspaceSlug}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
