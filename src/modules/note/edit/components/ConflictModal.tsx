"use client";

import { AlertTriangle, GitMerge, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConflictModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  localContent: string;
  remoteContent: string;
  onResolve: (resolvedContent: string) => void;
  onDiscardLocal: () => void;
}

export function ConflictModal({
  open,
  onOpenChange,
  localContent,
  remoteContent,
  onResolve,
  onDiscardLocal,
}: ConflictModalProps) {
  const [mergedContent, setMergedContent] = useState(localContent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[90vh] w-full max-w-6xl flex-col gap-0 overflow-hidden p-0"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="shrink-0 border-b border-border bg-secondary/60 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
                <AlertTriangle size={20} />
              </div>
              <div>
                <DialogTitle className="text-base">
                  Conflito de Edição Detectado!
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Alguém salvou alterações nesta nota enquanto você editava.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
            >
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 bg-muted/30 p-4 md:flex-row">
          {/* Remote (read-only) */}
          <div className="flex h-full flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs">
            <div className="shrink-0 border-b border-border bg-muted/50 px-4 py-3 text-sm font-semibold text-foreground">
              Versão Salva no Repositório (Remota)
            </div>
            <textarea
              readOnly
              value={remoteContent}
              className="flex-1 resize-none bg-muted/20 p-4 font-mono text-sm text-muted-foreground focus:outline-none"
            />
          </div>

          {/* Local (editable) */}
          <div className="flex h-full flex-1 flex-col overflow-hidden rounded-lg border border-primary/30 bg-card shadow-xs ring-1 ring-primary/20">
            <div className="shrink-0 border-b border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
              Sua Versão (Edite para combinar)
            </div>
            <textarea
              value={mergedContent}
              onChange={(e) => setMergedContent(e.target.value)}
              className="flex-1 resize-none p-4 font-mono text-sm text-foreground focus:outline-none"
              placeholder="Edite seu texto aqui baseando-se no texto ao lado..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border bg-card p-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onDiscardLocal}
            className="mr-auto"
          >
            Descartar minhas alterações
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>

          <Button type="button" onClick={() => onResolve(mergedContent)}>
            <GitMerge size={14} />
            Forçar Salvamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
