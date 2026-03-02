"use server";

import type { ActionResult } from "@/lib/action-result";
import { getFileContent } from "@/lib/github/api/repos";
import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";

export async function fetchVersion(
  owner: string,
  workspace: string,
  path: string,
  ref: string,
): Promise<ActionResult<{ content: string }>> {
  const session = await getRequiredSession();

  try {
    const octokit = getOctokit(session.accessToken || "");
    const repo = `anotado-${workspace}`;

    const file = await getFileContent(octokit, { owner, repo, path, ref });

    if (!file) {
      return { success: false, error: "Arquivo não encontrado." };
    }

    return { success: true, data: { content: file.content } };
  } catch (error) {
    console.error("[fetchVersion action]", error);
    return { success: false, error: "Erro ao buscar versão." };
  }
}
