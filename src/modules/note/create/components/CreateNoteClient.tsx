"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createNote } from "@/modules/note/actions/createNote";
import { NoteLayout } from "@/modules/note/components/NoteLayout";
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
  const [currentTitle, setCurrentTitle] = useState("");

  async function handleCreateNote(data: {
    title: string;
    category: string;
    content: string;
  }) {
    setCurrentTitle(data.title);
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

  return (
    <NoteLayout mode="create" owner={owner} workspace={workspace}>
      <NoteForm
        mode="create"
        categories={categories}
        onSubmit={handleCreateNote}
        isLoading={isLoading}
        error={error}
      />
    </NoteLayout>
  );
}
