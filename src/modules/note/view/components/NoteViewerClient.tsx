"use client";

import { Edit3, Loader2, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { NoteLayout } from "@/modules/note/components/NoteLayout";
import { useNoteViewerClient } from "../hooks/useNoteViewerClient";
import { NoteMainContent } from "./NoteMainContent";
import {
  NoteSidebar,
  NoteSidebarContent,
  NoteSidebarHeader,
  NoteSidebarHistoryHeader,
  NoteSidebarHistoryItem,
  NoteSidebarHistoryList,
  NoteSidebarSection,
  NoteSidebarToggle,
} from "./NoteRightSidebar";

export interface NoteViewerClientProps {
  owner: string;
  workspace: string;
  category: string;
  slug: string;
  initialContent: string;
  initialTitle: string;
}

export function NoteViewerClient({
  owner,
  workspace,
  category,
  slug,
  initialContent,
  initialTitle,
}: NoteViewerClientProps) {
  const {
    sidebarOpen,
    setSidebarOpen,
    history,
    version,
    deleteContext,
    setDeleteContext,
    handleSelectVersion,
    handleDeleteNote,
    isViewingOldVersion,
  } = useNoteViewerClient({
    owner,
    workspace,
    category,
    slug,
    initialContent,
  });

  return (
    <NoteLayout mode="view" owner={owner} workspace={workspace}>
      {/* Main content */}
      <NoteMainContent
        isViewingOldVersion={isViewingOldVersion}
        activeSha={version.activeSha}
        versionError={version.error}
        isFetchingVersion={version.isFetching}
        isDeleting={deleteContext.isDeleting}
        displayedContent={version.content}
      />

      {/* Right sidebar */}
      <NoteSidebar open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <NoteSidebarToggle />

        <NoteSidebarContent>
          <div className="px-6 pt-5 pb-6 flex flex-col gap-6 shrink-0">
            <NoteSidebarHeader title={initialTitle} category={category} />

            <Separator />

            <NoteSidebarSection>
              {!isViewingOldVersion ? (
                <>
                  <Link
                    href={`/note/edit?owner=${owner}&workspace=${workspace}&category=${category}&slug=${slug}`}
                    className={cn(
                      buttonVariants({ variant: "default", size: "lg" }),
                      "w-full justify-center",
                    )}
                  >
                    <Edit3 size={14} className="mr-2" />
                    Editar Nota
                  </Link>

                  <Button
                    type="button"
                    variant="destructive"
                    size="lg"
                    onClick={() =>
                      setDeleteContext((prev) => ({
                        ...prev,
                        confirmOpen: true,
                      }))
                    }
                    disabled={deleteContext.isDeleting}
                    className="w-full"
                  >
                    {deleteContext.isDeleting ? (
                      <Loader2 size={14} className="animate-spin mr-2" />
                    ) : (
                      <Trash2 size={14} className="mr-2" />
                    )}
                    {deleteContext.isDeleting ? "Excluindo..." : "Excluir Nota"}
                  </Button>

                  {deleteContext.error && (
                    <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                      {deleteContext.error}
                    </p>
                  )}

                  <AlertDialog
                    open={deleteContext.confirmOpen}
                    onOpenChange={(open) =>
                      setDeleteContext((prev) => ({
                        ...prev,
                        confirmOpen: open,
                      }))
                    }
                  >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir nota?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir{" "}
                          <strong className="text-foreground">
                            "{initialTitle}"
                          </strong>
                          ? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={handleDeleteNote}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => handleSelectVersion(history.commits[0].sha)}
                  className="w-full"
                >
                  <RotateCcw size={14} className="mr-2" />
                  Voltar para Atual
                </Button>
              )}
            </NoteSidebarSection>

            <Separator />

            <NoteSidebarHistoryHeader />
          </div>

          <NoteSidebarHistoryList>
            {history.isLoading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-lg bg-muted/60 animate-pulse"
                />
              ))
            ) : history.error ? (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {history.error}
              </p>
            ) : history.commits.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nenhuma versão encontrada.
              </p>
            ) : (
              history.commits.map((commit, index) => (
                <NoteSidebarHistoryItem
                  key={commit.sha}
                  commit={commit}
                  isActive={commit.sha === version.activeSha}
                  isLatest={index === 0}
                  onClick={() => handleSelectVersion(commit.sha)}
                />
              ))
            )}
          </NoteSidebarHistoryList>
        </NoteSidebarContent>
      </NoteSidebar>
    </NoteLayout>
  );
}
