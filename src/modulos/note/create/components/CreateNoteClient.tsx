"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createNote } from "@/modulos/note/actions/createNote";
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

    const result = await createNote({ owner, workspace, ...data });

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    router.push(
      `/note?owner=${owner}&workspace=${workspace}&category=${data.category}&slug=${result.data.slug}`,
    );
  }

  function handleCancel() {
    router.back();
  }

  return (
    <NoteForm
      mode="create"
      categories={categories}
      onSubmit={handleCreateNote}
      isLoading={isLoading}
      onCancel={handleCancel}
      error={error}
    />
  );
}
