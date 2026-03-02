"use server";

import type { ActionResult } from "@/lib/action-result";
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

    const { data: indexFile } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: "workspace-index.json",
    });

    if (
      Array.isArray(indexFile) ||
      indexFile.type !== "file" ||
      !indexFile.content
    ) {
      return { success: false, error: "Arquivo de índice não encontrado." };
    }

    const decoded = Buffer.from(indexFile.content, "base64").toString("utf-8");
    const indexData = JSON.parse(decoded);

    if (!indexData.categories) indexData.categories = ["geral"];

    if (indexData.categories.includes(category)) {
      return { success: false, error: "Essa categoria já existe." };
    }

    indexData.categories.push(category);

    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: "workspace-index.json",
      message: `feat: adicionar categoria ${category}`,
      content: Buffer.from(JSON.stringify(indexData, null, 2)).toString(
        "base64",
      ),
      sha: indexFile.sha,
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[createCategory action]", error);
    return { success: false, error: "Erro ao criar categoria." };
  }
}
