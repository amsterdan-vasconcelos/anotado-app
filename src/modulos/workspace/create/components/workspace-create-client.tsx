"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiCreateWorkspace } from "@/lib/api-client";

export function CreateWorkspaceClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    const result = await apiCreateWorkspace(name);

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    router.push(`/workspace/${result.data.owner}/${result.data.slug}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 bg-card text-card-foreground p-6 border border-border rounded-xl shadow-xs"
    >
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nome do Workspace</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Ex: Faculdade"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button variant={"outline"} size={"lg"} onClick={() => router.back()}>
          <ArrowLeft size={16} />
          Cancelar
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={isLoading || !name.trim()}
          className="ml-auto"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {isLoading ? "Criando e configurando..." : "Criar Workspace"}
        </Button>
      </div>
    </form>
  );
}
