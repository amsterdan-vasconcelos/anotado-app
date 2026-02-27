"use client";

import { ChevronDown, Folder, Trash2, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WorkspaceActionsMenuProps {
  onShareClick: () => void;
  onDeleteClick: () => void;
}

export function WorkspaceActionsMenu({
  onShareClick,
  onDeleteClick,
}: WorkspaceActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Folder size={16} />
        Workspace
        <ChevronDown
          size={14}
          className={cn("transition-transform", isOpen && "rotate-180")}
        />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-md py-1 z-50">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onShareClick();
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Users size={16} />
            Compartilhar
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onDeleteClick();
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={16} />
            Deletar Workspace
          </button>
        </div>
      )}
    </div>
  );
}
