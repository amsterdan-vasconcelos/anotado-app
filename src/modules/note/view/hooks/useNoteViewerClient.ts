import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteNote } from "../../actions/deleteNote";
import { type CommitRecord, fetchHistory } from "../../actions/fetchHistory";
import { fetchVersion } from "../../actions/fetchVersion";
import type { NoteViewerClientProps } from "../components/NoteViewerClient";

export function useNoteViewerClient({
  owner,
  workspace,
  category,
  slug,
  initialContent,
}: Omit<NoteViewerClientProps, "initialTitle">) {
  const router = useRouter();
  const path = `${category}/${slug}.md`;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [history, setHistory] = useState({
    commits: [] as CommitRecord[],
    isLoading: true,
    error: null as string | null,
  });

  const [version, setVersion] = useState({
    activeSha: "",
    content: initialContent,
    isFetching: false,
    error: null as string | null,
  });

  const [deleteContext, setDeleteContext] = useState({
    isDeleting: false,
    confirmOpen: false,
    error: null as string | null,
  });

  useEffect(() => {
    async function loadHistory() {
      const result = await fetchHistory(owner, workspace, path);

      if (result.success) {
        setHistory({ commits: result.data, isLoading: false, error: null });
        if (result.data.length > 0) {
          setVersion((prev) => ({ ...prev, activeSha: result.data[0].sha }));
        }
      } else {
        setHistory({ commits: [], isLoading: false, error: result.error });
      }
    }

    loadHistory();
  }, [owner, workspace, path]);

  async function handleSelectVersion(sha: string) {
    if (sha === version.activeSha) return;

    setVersion((prev) => ({
      ...prev,
      activeSha: sha,
      error: null,
      isFetching: true,
    }));

    if (history.commits.length > 0 && sha === history.commits[0].sha) {
      setVersion((prev) => ({
        ...prev,
        content: initialContent,
        isFetching: false,
      }));
      return;
    }

    const result = await fetchVersion(owner, workspace, path, sha);

    if (result.success) {
      const contentSplit = result.data.content.split("---");
      const cleanContent =
        contentSplit.length > 2
          ? contentSplit.slice(2).join("---").trim()
          : result.data.content;
      setVersion((prev) => ({
        ...prev,
        content: cleanContent,
        isFetching: false,
      }));
    } else {
      setVersion((prev) => ({
        ...prev,
        error: result.error,
        isFetching: false,
      }));
    }
  }

  async function handleDeleteNote() {
    setDeleteContext((prev) => ({ ...prev, isDeleting: true, error: null }));

    const result = await deleteNote({ owner, workspace, category, slug });

    if (!result.success) {
      setDeleteContext((prev) => ({
        ...prev,
        isDeleting: false,
        error: result.error,
      }));
      return;
    }

    router.push(`/workspaces/unit?owner=${owner}&workspace=${workspace}`);
    router.refresh();
  }

  const isViewingOldVersion =
    history.commits.length > 0 && version.activeSha !== history.commits[0].sha;

  return {
    sidebarOpen,
    setSidebarOpen,
    history,
    version,
    deleteContext,
    setDeleteContext,
    handleSelectVersion,
    handleDeleteNote,
    isViewingOldVersion,
  };
}
