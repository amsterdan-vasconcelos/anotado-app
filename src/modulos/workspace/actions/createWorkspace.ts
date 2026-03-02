"use server";

import type { ActionResult } from "@/lib/action-result";
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

    const { data: user } = await octokit.rest.users.getAuthenticated();

    await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      private: true,
      auto_init: true,
      description: `Workspace gerado pelo app de anotações: ${name}`,
    });

    const initialIndex = { categories: ["geral"], notes: [] };
    const encodedContent = Buffer.from(
      JSON.stringify(initialIndex, null, 2),
    ).toString("base64");

    // Aguarda o GitHub finalizar a inicialização do repositório
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: user.login,
      repo: repoName,
      path: "workspace-index.json",
      message: "feat: setup inicial do workspace",
      content: encodedContent,
    });

    return { success: true, data: { owner: user.login, slug } };
  } catch (error) {
    console.error("[createWorkspace action]", error);
    return { success: false, error: "Erro ao criar workspace." };
  }
}
