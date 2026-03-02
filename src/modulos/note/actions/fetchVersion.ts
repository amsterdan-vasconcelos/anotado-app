"use server";

import type { ActionResult } from "@/lib/action-result";
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

    const { data: fileData } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    if (
      !Array.isArray(fileData) &&
      fileData.type === "file" &&
      fileData.content
    ) {
      const content = Buffer.from(fileData.content, "base64").toString("utf-8");
      return { success: true, data: { content } };
    }

    return { success: false, error: "Formato de arquivo inválido." };
  } catch (error) {
    console.error("[fetchVersion action]", error);
    return { success: false, error: "Erro ao buscar versão." };
  }
}
