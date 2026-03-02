"use server";

import type { ActionResult } from "@/lib/action-result";
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

    const { data: indexFile } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: "workspace-index.json",
    });

    if (
      !Array.isArray(indexFile) &&
      indexFile.type === "file" &&
      indexFile.content
    ) {
      const decoded = Buffer.from(indexFile.content, "base64").toString(
        "utf-8",
      );
      const indexData = JSON.parse(decoded);
      return { success: true, data: indexData.categories ?? ["geral"] };
    }

    return { success: true, data: ["geral"] };
  } catch (error) {
    console.error("[fetchCategories]", error);
    return { success: false, error: "Erro ao buscar categorias." };
  }
}
