"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiCreateNote } from "@/lib/api-client";
import { NoteForm } from "./NoteForm";

interface CreateNoteClientProps {
  owner: string;
  workspace: string;
  categories: string[];
}

export function CreateNoteClient({
  owner,
  workspace,
  categories,
}: CreateNoteClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateNote(data: {
    title: string;
    category: string;
    content: string;
  }) {
    setIsLoading(true);
    setError(null);

    const result = await apiCreateNote({ owner, workspace, ...data });

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    router.push(
      `/workspace/${owner}/${workspace}/note/${data.category}/${result.data.slug}`,
    );
  }

  function handleCancel() {
    router.back();
  }

  return (
    <NoteForm
      categories={categories}
      onSubmit={handleCreateNote}
      isLoading={isLoading}
      onCancel={handleCancel}
      error={error}
    />
  );
}
