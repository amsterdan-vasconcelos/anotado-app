"use client";

import { ChevronDown, Folder, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkspaceActionsMenuProps {
  onShareClick: () => void;
  onDeleteClick: () => void;
}

export function WorkspaceActionsMenu({
  onShareClick,
  onDeleteClick,
}: WorkspaceActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="lg" />}>
        <Folder size={16} />
        Workspace
        <ChevronDown size={14} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="bottom" sideOffset={6}>
        <DropdownMenuItem onClick={onShareClick}>
          <Users size={16} />
          Compartilhar
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onClick={onDeleteClick}>
          <Trash2 size={16} />
          Deletar Workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
