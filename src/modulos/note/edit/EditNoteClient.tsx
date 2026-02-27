"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiUpdateNote } from "@/lib/api-client";
import { NoteForm } from "../create/components/NoteForm";
import { ConflictModal } from "./ConflitModal";

interface EditNoteClientProps {
  owner: string;
  workspace: string;
  oldCategory: string;
  oldSlug: string;
  categories: string[];
  sha: string;
  initialData: {
    title: string;
    category: string;
    content: string;
  };
}

export function EditNoteClient({
  owner,
  workspace,
  oldCategory,
  oldSlug,
  categories,
  sha: initialSha,
  initialData,
}: EditNoteClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [conflictData, setConflictData] = useState<{
    localContent: string;
    remoteContent: string;
    latestSha: string;
    title: string;
    category: string;
  } | null>(null);

  async function handleUpdateNote(
    data: { title: string; category: string; content: string },
    forceSha?: string,
  ) {
    setIsLoading(true);
    setError(null);

    const result = await apiUpdateNote({
      owner,
      workspace,
      oldCategory,
      oldSlug,
      sha: forceSha ?? initialSha,
      ...data,
    });

    setIsLoading(false);

    if (result.success) {
      setConflictData(null);
      router.push(
        `/workspaces/unit?owner=${owner}&workspace=${workspace}&category=${data.category}&slug=${result.data.slug}`,
      );
      return;
    }

    if ("conflict" in result && result.conflict) {
      setConflictData({
        localContent: data.content,
        remoteContent: result.remoteContent,
        latestSha: result.latestSha,
        title: data.title,
        category: data.category,
      });
      return;
    }

    if ("error" in result) setError(result.error);
  }

  function handleResolveConflict(resolvedContent: string) {
    if (!conflictData) return;
    handleUpdateNote(
      {
        title: conflictData.title,
        category: conflictData.category,
        content: resolvedContent,
      },
      conflictData.latestSha,
    );
  }

  function handleDiscardLocal() {
    window.location.reload();
  }

  function handleCancel() {
    router.back();
  }

  return (
    <>
      <NoteForm
        categories={categories}
        initialData={initialData}
        onSubmit={(data: any) => handleUpdateNote(data)}
        isLoading={isLoading}
        onCancel={handleCancel}
        error={error}
      />

      {conflictData && (
        <ConflictModal
          localContent={conflictData.localContent}
          remoteContent={conflictData.remoteContent}
          onResolve={handleResolveConflict}
          onDiscardLocal={handleDiscardLocal}
          onCancel={() => setConflictData(null)}
        />
      )}
    </>
  );
}
