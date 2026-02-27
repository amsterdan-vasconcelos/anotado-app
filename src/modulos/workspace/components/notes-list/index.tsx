"use client";

import { Filter } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NotesList } from "./NotesList";

interface Note {
  slug: string;
  title: string;
  category: string;
  date: string;
}

interface WorkspaceNotesViewerProps {
  notes: Note[];
  owner: string;
  workspace: string;
}

export function WorkspaceNotesViewer({
  notes,
  owner,
  workspace,
}: WorkspaceNotesViewerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");

  const categories = [
    "todas",
    ...Array.from(new Set(notes.map((n) => n.category))),
  ];

  const filteredNotes =
    selectedCategory === "todas"
      ? notes
      : notes.filter((n) => n.category === selectedCategory);

  return (
    <div className="mt-8 flex flex-col gap-6">
      {notes.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <Filter size={16} className="text-muted-foreground shrink-0" />
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      <NotesList notes={filteredNotes} owner={owner} workspace={workspace} />
    </div>
  );
}
