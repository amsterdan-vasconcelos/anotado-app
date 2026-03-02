"use server";

import type { ActionResult } from "@/lib/action-result";
import { listCollaborators } from "@/lib/github/api/repos";
import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";

export interface Collaborator {
  id: number;
  login: string;
  avatarUrl: string;
}

export async function fetchCollaborators(
  owner: string,
  workspace: string,
): Promise<ActionResult<Collaborator[]>> {
  const session = await getRequiredSession();

  try {
    const octokit = getOctokit(session.accessToken ?? "");
    const repo = `anotado-${workspace}`;

    const collaborators = await listCollaborators(octokit, { owner, repo });

    return { success: true, data: collaborators };
  } catch (error) {
    console.error("[fetchCollaborators]", error);
    return { success: false, error: "Erro ao buscar colaboradores." };
  }
}
