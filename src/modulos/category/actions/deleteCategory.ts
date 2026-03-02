"use server";

import type { ActionResult } from "@/lib/action-result";
import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";

export async function deleteCategory(
  owner: string,
  workspace: string,
  category: string,
): Promise<ActionResult> {
  const session = await getRequiredSession();

  try {
    const octokit = getOctokit(session.accessToken || "");
    const repo = `anotado-${workspace}`;

    // 1. Atualizar workspace-index.json removendo a categoria e suas notas
    try {
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

        if (indexData.categories) {
          indexData.categories = indexData.categories.filter(
            (c: string) => c !== category,
          );
        }

        if (indexData.notes) {
          indexData.notes = indexData.notes.filter(
            (n: { category: string }) => n.category !== category,
          );
        }

        await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: "workspace-index.json",
          message: `chore: remover categoria ${category}`,
          content: Buffer.from(JSON.stringify(indexData, null, 2)).toString(
            "base64",
          ),
          sha: indexFile.sha,
        });
      }
    } catch (err) {
      console.error("[deleteCategory] Erro ao atualizar index:", err);
    }

    // 2. Deletar todos os arquivos .md da pasta da categoria
    try {
      const { data: files } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: category,
      });

      if (Array.isArray(files)) {
        for (const file of files) {
          if (file.type === "file") {
            await octokit.rest.repos.deleteFile({
              owner,
              repo,
              path: file.path,
              message: `chore: excluir nota junto com a categoria ${category}`,
              sha: file.sha,
            });
          }
        }
      }
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status !== 404) throw err;
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[deleteCategory action]", error);
    return { success: false, error: "Erro ao excluir categoria." };
  }
}
