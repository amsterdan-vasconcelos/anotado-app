"use server";

import type { ActionResult } from "@/lib/action-result";
import { getFileContent } from "@/lib/github/api/repos";
import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";

export async function fetchCategories(
  owner: string,
  workspace: string,
): Promise<ActionResult<string[]>> {
  const session = await getRequiredSession();

  try {
    const octokit = getOctokit(session.accessToken || "");
    const repo = `anotado-${workspace}`;

    const indexFile = await getFileContent(octokit, {
      owner,
      repo,
      path: "workspace-index.json",
    });

    if (!indexFile) {
      return { success: true, data: ["geral"] };
    }

    const indexData = JSON.parse(indexFile.content);
    return { success: true, data: indexData.categories ?? ["geral"] };
  } catch (error) {
    console.error("[fetchCategories]", error);
    return { success: false, error: "Erro ao buscar categorias." };
  }
}
