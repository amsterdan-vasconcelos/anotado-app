"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { formatDisplayName } from "@/lib/string-util";
import { cn } from "@/lib/utils";
import { WorkspaceHeaderActions } from "./WorkspaceHeaderActions";

interface WorkspaceHeaderProps {
  owner: string;
  workspaceSlug: string;
  displayName: string;
}

export function WorkspaceHeader({
  owner,
  workspaceSlug,
  displayName,
}: WorkspaceHeaderProps) {
  const prettyOwner = formatDisplayName(owner);

  return (
    <header className="mb-8">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "mb-4 -ml-2 gap-2 text-muted-foreground",
        )}
      >
        <ArrowLeft size={16} />
        Voltar aos Workspaces
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {displayName}
          </h1>
          <p className="text-muted-foreground text-sm">
            Proprietário: {prettyOwner}
          </p>
        </div>

        <WorkspaceHeaderActions owner={owner} workspaceSlug={workspaceSlug} />
      </div>
    </header>
  );
}
