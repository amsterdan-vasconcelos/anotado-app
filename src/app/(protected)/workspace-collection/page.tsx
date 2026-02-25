import { Settings } from "lucide-react";
import { redirect } from "next/navigation";
import { RequestError } from "octokit";
import { WorkspaceEmptyState } from "@/components/workspace/WorkspaceEmptyState";
import { WorkspaceGrid } from "@/components/workspace/WorkspaceGrid";
import { HomeHeader } from "@/components/workspace/WorkspaceHeader";
import { auth, signOut } from "@/lib/auth";
import { getOctokit } from "@/lib/octokit";
import type { CustomSession } from "@/types/auth";

const findWorkspaces = async (accessToken: string) => {
  const octokit = getOctokit(accessToken);

  try {
    const [
      { data: user },
      {
        data: { installations },
      },
    ] = await Promise.all([
      octokit.rest.users.getAuthenticated(),
      octokit.rest.apps.listInstallationsForAuthenticatedUser(),
    ]);

    console.log(installations);

    const hasPersonalInstallation = installations.some((inst) => {
      const account = inst.account;
      return account && "login" in account && account.login === user.login;
    });

    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      affiliation: "owner,collaborator",
      sort: "updated",
      per_page: 100,
    });

    const workspaces = repos.filter((repo) => repo.name.startsWith("anotado-"));

    return { workspaces, hasPersonalInstallation, user };
  } catch (error: unknown) {
    if (error instanceof RequestError && error.status === 401) {
      await signOut({ redirect: false });
      redirect("/login");
    }

    throw error;
  }
};

const HomePage = async () => {
  const session = (await auth()) as CustomSession;

  if (!session?.accessToken) redirect("/login");

  const { workspaces, hasPersonalInstallation, user } = await findWorkspaces(
    session.accessToken,
  );
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
