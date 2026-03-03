import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownViewer } from "./MarkdownViewer";

interface NoteMainContentProps {
  isViewingOldVersion: boolean;
  activeSha: string;
  versionError: string | null;
  isFetchingVersion: boolean;
  isDeleting: boolean;
  displayedContent: string;
}

export function NoteMainContent({
  isViewingOldVersion,
  activeSha,
  versionError,
  isFetchingVersion,
  isDeleting,
  displayedContent,
}: NoteMainContentProps) {
  return (
    <main className="flex-1 overflow-y-auto bg-muted/30 flex justify-center py-12 px-6">
      <div className="w-full max-w-3xl flex flex-col gap-4">
        {isViewingOldVersion && (
          <div className="flex items-start gap-3 bg-secondary border border-border p-4 rounded-xl">
            <AlertCircle size={18} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-foreground">
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

        {versionError && (
          <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 p-4 rounded-xl">
            <AlertCircle
              size={18}
              className="text-destructive mt-0.5 shrink-0"
            />
            <p className="text-destructive">{versionError}</p>
          </div>
        )}

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
  );
}
