"use client";

import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Edit3,
  GitCommit,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { CommitRecord } from "@/lib/api-client";
import {
  apiDeleteNote,
  apiFetchHistory,
  apiFetchVersion,
} from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { MarkdownViewer } from "./MarkdownViewer";

interface NoteViewerClientProps {
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
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commits, setCommits] = useState<CommitRecord[]>([]);
  const [activeSha, setActiveSha] = useState<string>("");
  const [displayedContent, setDisplayedContent] = useState(initialContent);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isFetchingVersion, setIsFetchingVersion] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [versionError, setVersionError] = useState<string | null>(null);

  const path = `${category}/${slug}.md`;

  useEffect(() => {
    async function loadHistory() {
      const result = await apiFetchHistory(owner, workspace, path);

      if (result.success) {
        setCommits(result.data);
        if (result.data.length > 0) {
          setActiveSha(result.data[0].sha);
        }
      } else {
        setHistoryError(result.error);
      }

      setIsLoadingHistory(false);
    }

    loadHistory();
  }, [owner, workspace, path]);

  async function handleSelectVersion(sha: string) {
    if (sha === activeSha) return;

    setActiveSha(sha);
    setVersionError(null);

    if (commits.length > 0 && sha === commits[0].sha) {
      setDisplayedContent(initialContent);
      return;
    }

    setIsFetchingVersion(true);

    const result = await apiFetchVersion(owner, workspace, path, sha);

    if (result.success) {
      const contentSplit = result.data.content.split("---");
      const cleanContent =
        contentSplit.length > 2
          ? contentSplit.slice(2).join("---").trim()
          : result.data.content;
      setDisplayedContent(cleanContent);
    } else {
      setVersionError(result.error);
    }

    setIsFetchingVersion(false);
  }

  async function handleDeleteNote() {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a nota "${initialTitle}"? Esta ação não pode ser desfeita.`,
    );

    if (!confirmed) return;

    setIsDeleting(true);
    setDeleteError(null);

    const result = await apiDeleteNote({ owner, workspace, category, slug });

    if (!result.success) {
      setDeleteError(result.error);
      setIsDeleting(false);
      return;
    }

    router.push(`/workspaces/unit?owner=${owner}&workspace=${workspace}`);
    router.refresh();
  }

  const isViewingOldVersion =
    commits.length > 0 && activeSha !== commits[0].sha;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Coluna esquerda — botão voltar */}
      <aside className="w-14 shrink-0 flex flex-col items-center pt-6 border-r border-border bg-card">
        <Link
          href={`/workspaces/unit?owner=${owner}&workspace=${workspace}`}
          title="Voltar ao workspace"
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
      </aside>

      {/* Coluna central — papel de leitura */}
      <main className="flex-1 overflow-y-auto bg-muted/30 flex justify-center py-12 px-6">
        <div className="w-full max-w-3xl flex flex-col gap-4">
          {/* Banner: visualizando versão antiga */}
          {isViewingOldVersion && (
            <div className="flex items-start gap-3 bg-secondary border border-border p-4 rounded-xl">
              <AlertCircle size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Modo histórico — versão{" "}
                  <span className="font-mono">{activeSha.substring(0, 7)}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Você está visualizando uma versão antiga. Para editar, volte
                  para a versão atual.
                </p>
              </div>
            </div>
          )}

          {/* Banner: erro ao carregar versão */}
          {versionError && (
            <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 p-4 rounded-xl">
              <AlertCircle
                size={18}
                className="text-destructive mt-0.5 shrink-0"
              />
              <p className="text-sm text-destructive">{versionError}</p>
            </div>
          )}

          {/* Papel */}
          <div
            className={cn(
              "bg-card rounded-2xl shadow-md ring-1 ring-border/60 min-h-full px-10 py-10 transition-opacity",
              isFetchingVersion || isDeleting ? "opacity-50" : "opacity-100",
            )}
          >
            <MarkdownViewer content={displayedContent} />
          </div>
        </div>
      </main>

      {/* Coluna direita — colapsável */}
      <aside
        className={cn(
          "shrink-0 flex flex-col border-l border-border bg-card overflow-hidden",
          "transition-[width] duration-200 ease-in-out",
          sidebarOpen ? "w-72" : "w-14",
        )}
      >
        {/* Botão de toggle — sempre visível no topo */}
        <div
          className={cn(
            "pt-6 shrink-0 flex",
            sidebarOpen ? "px-6 justify-end" : "justify-center",
          )}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Fechar painel" : "Abrir painel"}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {sidebarOpen ? (
              <PanelRightClose size={20} />
            ) : (
              <PanelRightOpen size={20} />
            )}
          </button>
        </div>

        {/* Conteúdo — fade in/out com a abertura */}
        <div
          className={cn(
            "flex flex-col min-h-0 flex-1 transition-opacity duration-150",
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          {/* Seção estática: metadados + ações */}
          <div className="px-6 pt-5 pb-6 flex flex-col gap-6 shrink-0">
            {/* Metadados */}
            <div>
              <h2 className="text-base font-semibold text-foreground leading-snug">
                {initialTitle}
              </h2>
              <div className="mt-2">
                <Badge variant="secondary">{category}</Badge>
              </div>
            </div>

            <Separator />

            {/* Ações */}
            <div className="flex flex-col gap-2">
              {!isViewingOldVersion ? (
                <>
                  <Link
                    href={`/note/edit?owner=${owner}&workspace=${workspace}&category=${category}&slug=${slug}`}
                    className={cn(
                      buttonVariants({ variant: "default", size: "lg" }),
                      "w-full justify-center",
                    )}
                  >
                    <Edit3 size={14} />
                    Editar Nota
                  </Link>

                  <Button
                    type="button"
                    variant="destructive"
                    size="lg"
                    onClick={handleDeleteNote}
                    disabled={isDeleting}
                    className="w-full"
                  >
                    {isDeleting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    {isDeleting ? "Excluindo..." : "Excluir Nota"}
                  </Button>

                  {deleteError && (
                    <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                      {deleteError}
                    </p>
                  )}
                </>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => handleSelectVersion(commits[0].sha)}
                  className="w-full"
                >
                  <RotateCcw size={14} />
                  Voltar para Atual
                </Button>
              )}
            </div>

            <Separator />

            {/* Cabeçalho do histórico */}
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock size={14} className="text-primary" />
              Histórico de Versões
            </div>
          </div>

          {/* Seção scrollável: commits */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-2">
            {isLoadingHistory ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-lg bg-muted/60 animate-pulse"
                />
              ))
            ) : historyError ? (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {historyError}
              </p>
            ) : commits.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nenhuma versão encontrada.
              </p>
            ) : (
              commits.map((commit, index) => {
                const isLatest = index === 0;
                const isActive = commit.sha === activeSha;
                const date = new Date(commit.date).toLocaleString("pt-BR");

                return (
                  <button
                    key={commit.sha}
                    type="button"
                    onClick={() => handleSelectVersion(commit.sha)}
                    className={cn(
                      "text-left p-3 rounded-lg border transition-all w-full",
                      isActive
                        ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:border-border/80 hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-medium text-foreground text-xs truncate">
                        {commit.message}
                      </span>
                      {isLatest && (
                        <Badge
                          variant="default"
                          className="shrink-0 text-[10px]"
                        >
                          HEAD
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mb-1.5">
                      {commit.authorAvatar ? (
                        <Image
                          src={commit.authorAvatar}
                          alt={commit.authorName}
                          width={16}
                          height={16}
                          className="rounded-full shrink-0"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                          <span className="text-muted-foreground font-bold text-[8px]">
                            {commit.authorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-muted-foreground text-xs truncate">
                        {commit.authorName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground text-[10px]">
                      <GitCommit size={10} />
                      <span className="font-mono">
                        {commit.sha.substring(0, 7)}
                      </span>
                      <span className="mx-0.5">•</span>
                      <span>{date}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
