import { Plus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export function WorkspaceEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-xl shadow-xs text-center">
      <h2 className="text-2xl font-bold mb-4 text-foreground">
        Nenhum workspace encontrado
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Você ainda não possui nenhum workspace configurado. Crie um novo para
        começar a organizar suas anotações.
      </p>

      <Link
        href="/create-workspace"
        className={cn(buttonVariants({ variant: "default", size: "lg" }))}
      >
        <Plus size={16} />
        Criar Workspace
      </Link>
    </div>
  );
}
