"use server";

import type { ActionResult } from "@/lib/action-result";
import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";

export interface Collaborator {
  id: number;
  login: string;
  avatar_url: string;
}

export async function fetchCollaborators(
  owner: string,
  workspace: string,
): Promise<ActionResult<Collaborator[]>> {
  const session = await getRequiredSession();

  try {
    const octokit = getOctokit(session.accessToken ?? "");
    const repo = `anotado-${workspace}`;

    const { data } = await octokit.rest.repos.listCollaborators({
      owner,
      repo,
    });

    const collaborators: Collaborator[] = data.map((c) => ({
      id: c.id,
      login: c.login,
      avatar_url: c.avatar_url,
    }));

    return { success: true, data: collaborators };
  } catch (error) {
    console.error("[fetchCollaborators]", error);
    return { success: false, error: "Erro ao buscar colaboradores." };
  }
}
