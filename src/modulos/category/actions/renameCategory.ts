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

export interface RenameCategoryInput {
  owner: string;
  workspace: string;
  oldCategory: string;
  newCategory: string;
}

export async function renameCategory(
  input: RenameCategoryInput,
): Promise<ActionResult> {
  const session = await getRequiredSession();

  const { owner, workspace, oldCategory, newCategory } = input;
  const octokit = getOctokit(session.accessToken || "");
  const repo = `anotado-${workspace}`;

  try {
    // 1. Atualizar workspace-index.json
    try {
      const indexFile = await getFileContent(octokit, {
        owner,
        repo,
        path: "workspace-index.json",
      });

      if (indexFile) {
        const indexData = JSON.parse(indexFile.content);

        if (indexData.categories) {
          indexData.categories = indexData.categories.map((c: string) =>
            c === oldCategory ? newCategory : c,
          );
        }

        if (indexData.notes) {
          indexData.notes = indexData.notes.map((n: any) =>
            n.category === oldCategory ? { ...n, category: newCategory } : n,
          );
        }

        await upsertFile(octokit, {
          owner,
          repo,
          path: "workspace-index.json",
          message: `refactor: renomear categoria ${oldCategory} → ${newCategory}`,
          content: JSON.stringify(indexData, null, 2),
          sha: indexFile.sha,
        });
      }
    } catch (e) {
      console.error("[renameCategory] Erro ao atualizar index:", e);
    }

    // 2. Mover arquivos .md para a nova pasta
    const files = await getDirectoryContent(octokit, {
      owner,
      repo,
      path: oldCategory,
    });

    if (files) {
      for (const file of files) {
        if (file.type === "file" && file.name.endsWith(".md")) {
          const fileData = await getFileContent(octokit, {
            owner,
            repo,
            path: file.path,
          });

          if (fileData) {
            const updatedContent = fileData.content.replace(
              new RegExp(`category:\\s*"${oldCategory}"`),
              `category: "${newCategory}"`,
            );

            await upsertFile(octokit, {
              owner,
              repo,
              path: `${newCategory}/${file.name}`,
              message: `refactor: mover nota para categoria ${newCategory}`,
              content: updatedContent,
            });

            await deleteFile(octokit, {
              owner,
              repo,
              path: file.path,
              message: `chore: remover nota da categoria antiga ${oldCategory}`,
              sha: file.sha,
            });
          }
        }
      }
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[renameCategory action]", error);
    return { success: false, error: "Erro ao renomear categoria." };
  }
}
