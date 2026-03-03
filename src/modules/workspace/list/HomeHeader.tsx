import { ChevronDown, Download, Mail, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutForm } from "@/modules/auth/components/SignOutButton";

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
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="lg" />}>
            <Settings size={16} />
            Menu
            <ChevronDown size={14} />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={6}
            className="min-w-max"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem>
                <a
                  href="https://github.com/notifications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-2"
                >
                  <Mail size={16} />
                  Ver Convites
                </a>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <a
                  href="https://github.com/settings/installations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-2"
                >
                  <Settings size={16} />
                  Gerenciar Acessos
                </a>
              </DropdownMenuItem>

              {hasPersonalInstallation ? (
                <DropdownMenuItem>
                  <Link
                    href="/workspaces/create"
                    className="flex w-full items-center gap-2"
                  >
                    <Plus size={16} />
                    Novo Workspace
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://github.com/apps/${appSlug}/installations/new`}
                    className="flex w-full items-center gap-2"
                  >
                    <Download size={16} />
                    Instalar para Criar
                  </a>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <SignOutForm className="w-full justify-start" />
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
