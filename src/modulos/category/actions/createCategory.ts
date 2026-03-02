"use server";

import type { ActionResult } from "@/lib/action-result";
import { getFileContent, upsertFile } from "@/lib/github/api/repos";
import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";

export async function createCategory(
  owner: string,
  workspace: string,
  category: string,
): Promise<ActionResult> {
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
      return { success: false, error: "Arquivo de índice não encontrado." };
    }

    const indexData = JSON.parse(indexFile.content);

    if (!indexData.categories) indexData.categories = ["geral"];

    if (indexData.categories.includes(category)) {
      return { success: false, error: "Essa categoria já existe." };
    }

    indexData.categories.push(category);

    await upsertFile(octokit, {
      owner,
      repo,
      path: "workspace-index.json",
      message: `feat: adicionar categoria ${category}`,
      content: JSON.stringify(indexData, null, 2),
      sha: indexFile.sha,
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[createCategory action]", error);
    return { success: false, error: "Erro ao criar categoria." };
  }
}
