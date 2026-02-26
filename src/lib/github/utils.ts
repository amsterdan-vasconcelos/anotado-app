import { redirect } from "next/navigation";
import { RequestError } from "octokit";
import { signOut } from "../auth";
import { getOctokit } from "../octokit";

const getUserInstallationStatus = async (accessToken: string) => {
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

    const hasPersonalInstallation = installations.some((inst) => {
      const account = inst.account;
      return account && "login" in account && account.login === user.login;
    });

    return { user, hasPersonalInstallation };
  } catch (error: unknown) {
    if (error instanceof RequestError && error.status === 401) {
      await signOut({ redirect: false });
      redirect("/login");
    }

    throw error;
  }
};

const getUserWorkspaces = async (accessToken: string) => {
  const octokit = getOctokit(accessToken);

  try {
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      affiliation: "owner,collaborator",
      sort: "updated",
      per_page: 100,
    });

    const workspaces = repos.filter((repo) => repo.name.startsWith("anotado-"));

    return { workspaces };
  } catch (error: unknown) {
    if (error instanceof RequestError && error.status === 401) {
      await signOut({ redirect: false });
      redirect("/login");
    }

    throw error;
  }
};

export const utils = { getUserInstallationStatus, getUserWorkspaces };
