import { Download, Plus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type HomeHeaderProps = {
  hasPersonalInstallation: boolean;
  appSlug: string;
};

export function HomeHeader({
  hasPersonalInstallation,
  appSlug,
}: HomeHeaderProps) {
  return (
    <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Meus Workspaces</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas anotações e pastas.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="https://github.com/notifications"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
        >
          Ver Convites
        </a>

        <a
          href="https://github.com/settings/installations"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          <span className="hidden sm:inline">Gerenciar Acessos</span>
        </a>

        {hasPersonalInstallation ? (
          <Link
            href="/workspaces/create"
            className={cn(buttonVariants({ variant: "default", size: "lg" }))}
          >
            <Plus size={16} />
            Novo Workspace
          </Link>
        ) : (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://github.com/apps/${appSlug}/installations/new`}
            className={cn(buttonVariants({ variant: "default", size: "lg" }))}
          >
            <Download size={16} />
            Instalar para Criar
          </a>
        )}
      </div>
    </header>
  );
}
