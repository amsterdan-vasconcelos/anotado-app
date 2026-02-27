import { Settings } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { github } from "@/lib/github";
import { WorkspaceEmptyState } from "@/modulos/workspaces/components/WorkspaceEmptyState";
import { WorkspaceGrid } from "@/modulos/workspaces/components/WorkspaceGrid";
import { HomeHeader } from "@/modulos/workspaces/components/WorkspaceHeader";
import type { CustomSession } from "@/types/auth";

const HomePage = async () => {
  const session = (await auth()) as CustomSession;

  if (!session?.accessToken) redirect("/signin");

  const [installationData, workspacesData] = await Promise.all([
    github.utils.getUserInstallationStatus(session.accessToken),
    github.utils.getUserWorkspaces(session.accessToken),
  ]);

  const { user, hasPersonalInstallation } = installationData;
  const { workspaces } = workspacesData;

  const appSlug = process.env.GITHUB_APP_SLUG || "";

  return (
    <div className="bg-background text-foreground min-h-screen p-8">
      <main className="max-w-5xl mx-auto">
        <HomeHeader
          hasPersonalInstallation={hasPersonalInstallation}
          appSlug={appSlug}
        />

        {workspaces.length === 0 && (
          <div className="mb-8 bg-secondary border border-border p-4 rounded-lg flex items-start gap-3">
            <div className="text-primary mt-1">
              <Settings size={20} />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Não está vendo um workspace compartilhado?
              </p>
              <p className="text-muted-foreground">
                Certifique-se de ter aceitado o convite no GitHub e de que o
                aplicativo tem acesso ao repositório nas suas
                <a
                  href="https://github.com/settings/installations"
                  target="_blank"
                  className="underline ml-1 font-bold text-primary"
                  rel="noopener"
                >
                  configurações de instalação
                </a>
                .
              </p>
            </div>
          </div>
        )}

        {workspaces.length === 0 ? (
          <WorkspaceEmptyState />
        ) : (
          <WorkspaceGrid user={user} workspaces={workspaces} />
        )}
      </main>
    </div>
  );
};

export default HomePage;
