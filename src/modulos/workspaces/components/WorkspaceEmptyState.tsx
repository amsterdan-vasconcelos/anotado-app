import { Plus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function WorkspaceEmptyState() {
  return (
    <Card className="text-center">
      <CardContent className="flex flex-col items-center gap-4 py-12">
        <h2 className="text-2xl font-bold text-foreground">
          Nenhum workspace encontrado
        </h2>
        <p className="text-muted-foreground max-w-md">
          Você ainda não possui nenhum workspace configurado. Crie um novo para
          começar a organizar suas anotações.
        </p>
        <Link
          href="/workspaces/create"
          className={cn(buttonVariants({ variant: "default", size: "lg" }))}
        >
          <Plus size={16} />
          Criar Workspace
        </Link>
      </CardContent>
    </Card>
  );
}
