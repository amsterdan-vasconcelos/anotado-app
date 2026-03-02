"use server";

import type { ActionResult } from "@/lib/action-result";
import {
  deleteFile,
  getDirectoryContent,
  getFileContent,
  upsertFile,
} from "@/lib/github/api/repos";
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
      const indexFile = await getFileContent(octokit, {
        owner,
        repo,
        path: "workspace-index.json",
      });

      if (indexFile) {
        const indexData = JSON.parse(indexFile.content);

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

        await upsertFile(octokit, {
          owner,
          repo,
          path: "workspace-index.json",
          message: `chore: remover categoria ${category}`,
          content: JSON.stringify(indexData, null, 2),
          sha: indexFile.sha,
        });
      }
    } catch (err) {
      console.error("[deleteCategory] Erro ao atualizar index:", err);
    }

    // 2. Deletar todos os arquivos .md da pasta da categoria
    const files = await getDirectoryContent(octokit, {
      owner,
      repo,
      path: category,
    });

    if (files) {
      for (const file of files) {
        if (file.type === "file") {
          await deleteFile(octokit, {
            owner,
            repo,
            path: file.path,
            message: `chore: excluir nota junto com a categoria ${category}`,
            sha: file.sha,
          });
        }
      }
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[deleteCategory action]", error);
    return { success: false, error: "Erro ao excluir categoria." };
  }
}
