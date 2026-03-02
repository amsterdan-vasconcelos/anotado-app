import { redirect } from "next/navigation";
import { RequestError } from "octokit";
import { getOctokit } from "../octokit";
import { getFileContent, listUserRepos } from "./api/repos";
import { getAuthenticatedUser, listUserInstallations } from "./api/users";

const checkHasWorkspaceIndex = async (
  octokit: ReturnType<typeof getOctokit>,
  owner: string,
  repo: string,
): Promise<boolean> => {
  const file = await getFileContent(octokit, {
    owner,
    repo,
    path: "workspace-index.json",
  });
  return file !== null;
};

const getUserInstallationStatus = async (accessToken: string) => {
  const octokit = getOctokit(accessToken);

  try {
    const [user, installations] = await Promise.all([
      getAuthenticatedUser(octokit),
      listUserInstallations(octokit),
    ]);

    const hasPersonalInstallation = installations.some(
      (inst) => inst.account?.login === user.login,
    );

    return { user, hasPersonalInstallation };
  } catch (error: unknown) {
    if (error instanceof RequestError && error.status === 401) {
      redirect("/api/auth/signout");
    }

    throw error;
  }
};

const getUserWorkspaces = async (accessToken: string) => {
  const octokit = getOctokit(accessToken);

  try {
    const repos = await listUserRepos(octokit);

    const candidates = repos.filter((repo) => repo.name.startsWith("anotado-"));

    const workspaceChecks = await Promise.all(
      candidates.map(async (repo) => {
        const isValid = await checkHasWorkspaceIndex(
          octokit,
          repo.owner.login,
          repo.name,
        );
        return isValid ? repo : null;
      }),
    );

    const workspaces = workspaceChecks.filter((repo) => repo !== null);

    return { workspaces };
  } catch (error: unknown) {
    if (error instanceof RequestError && error.status === 401) {
      redirect("/api/auth/signout");
    }

    throw error;
  }
};

export const utils = { getUserInstallationStatus, getUserWorkspaces };
