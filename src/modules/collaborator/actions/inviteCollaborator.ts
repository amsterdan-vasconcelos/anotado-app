"use server";

import type { ActionResult } from "@/lib/action-result";
import { addCollaborator } from "@/lib/github/api/repos";
import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";

export async function inviteCollaborator(
  owner: string,
  workspace: string,
  username: string,
): Promise<ActionResult> {
  const session = await getRequiredSession();

  try {
    const octokit = getOctokit(session.accessToken || "");
    const repo = `anotado-${workspace}`;

    await addCollaborator(octokit, { owner, repo, username });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[inviteCollaborator action]", error);
    return { success: false, error: "Erro ao convidar usuário." };
  }
}
