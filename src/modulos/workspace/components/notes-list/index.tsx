"use client";

import { Filter } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
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
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          <Filter size={16} className="shrink-0 text-muted-foreground" />
          <div className="flex gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                type="button"
                size="sm"
                variant={selectedCategory === cat ? "default" : "ghost"}
                onClick={() => setSelectedCategory(cat)}
                className="rounded-full whitespace-nowrap"
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      )}

      <NotesList notes={filteredNotes} owner={owner} workspace={workspace} />
    </div>
  );
}
