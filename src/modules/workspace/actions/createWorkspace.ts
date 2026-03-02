"use server";

import type { ActionResult } from "@/lib/action-result";
import { createRepo, upsertFile } from "@/lib/github/api/repos";
import { getAuthenticatedUser } from "@/lib/github/api/users";
import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";
import { generateSlug } from "@/lib/string-util";

export async function createWorkspace(
  name: string,
): Promise<ActionResult<{ owner: string; slug: string }>> {
  const session = await getRequiredSession();

  try {
    const slug = generateSlug(name);
    const repoName = `anotado-${slug}`;
    const octokit = getOctokit(session.accessToken || "");

    const user = await getAuthenticatedUser(octokit);

    await createRepo(octokit, {
      name: repoName,
      private: true,
      autoInit: true,
      description: `Workspace gerado pelo app de anotações: ${name}`,
    });

    const initialIndex = { categories: ["geral"], notes: [] };

    // Aguarda o GitHub finalizar a inicialização do repositório
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await upsertFile(octokit, {
      owner: user.login,
      repo: repoName,
      path: "workspace-index.json",
      message: "feat: setup inicial do workspace",
      content: JSON.stringify(initialIndex, null, 2),
    });

    return { success: true, data: { owner: user.login, slug } };
  } catch (error) {
    console.error("[createWorkspace action]", error);
    return { success: false, error: "Erro ao criar workspace." };
  }
}
