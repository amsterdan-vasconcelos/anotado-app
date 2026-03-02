"use server";

import type { ActionResult } from "@/lib/action-result";
import { deleteRepo } from "@/lib/github/api/repos";
import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";

export async function deleteWorkspace(
  owner: string,
  workspace: string,
): Promise<ActionResult> {
  const session = await getRequiredSession();

  try {
    const octokit = getOctokit(session.accessToken ?? "");
    const repoName = `anotado-${workspace}`;

    await deleteRepo(octokit, { owner, repo: repoName });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[deleteWorkspace]", error);
    return { success: false, error: "Erro ao excluir workspace." };
  }
}
