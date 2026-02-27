"use client";

import { AlertTriangle, GitMerge, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ConflictModalProps {
  localContent: string;
  remoteContent: string;
  onResolve: (resolvedContent: string) => void;
  onDiscardLocal: () => void;
  onCancel: () => void;
}

export function ConflictModal({
  localContent,
  remoteContent,
  onResolve,
  onDiscardLocal,
  onCancel,
}: ConflictModalProps) {
  const [mergedContent, setMergedContent] = useState(localContent);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-border">
        <div className="bg-secondary/60 border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-destructive/10 text-destructive p-2 rounded-lg">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Conflito de Edição Detectado!
              </h2>
              <p className="text-sm text-muted-foreground">
                Alguém salvou alterações nesta nota enquanto você editava.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onCancel}
          >
            <X size={16} />
          </Button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-muted/30 p-4 gap-4">
          <div className="flex-1 flex flex-col h-full border border-border rounded-lg bg-card overflow-hidden shadow-xs">
            <div className="bg-muted/50 px-4 py-3 border-b border-border text-sm font-semibold text-foreground">
              Versão Salva no Repositório (Remota)
            </div>
            <textarea
              readOnly
              value={remoteContent}
              className="flex-1 p-4 bg-muted/20 focus:outline-none font-mono text-sm text-muted-foreground resize-none"
            />
          </div>

          <div className="flex-1 flex flex-col h-full border border-primary/30 rounded-lg bg-card overflow-hidden shadow-xs ring-1 ring-primary/20">
            <div className="bg-primary/10 px-4 py-3 border-b border-primary/20 text-sm font-semibold text-primary">
              Sua Versão (Edite para combinar)
            </div>
            <textarea
              value={mergedContent}
              onChange={(e) => setMergedContent(e.target.value)}
              className="flex-1 p-4 focus:outline-none font-mono text-sm text-foreground resize-none"
              placeholder="Edite seu texto aqui baseando-se no texto ao lado..."
            />
          </div>
        </div>

        <div className="p-4 border-t border-border bg-card flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onDiscardLocal}
            className="mr-auto"
          >
            Descartar minhas alterações
          </Button>

          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button type="button" onClick={() => onResolve(mergedContent)}>
            <GitMerge size={14} />
            Forçar Salvamento
          </Button>
        </div>
      </div>
    </div>
  );
}
