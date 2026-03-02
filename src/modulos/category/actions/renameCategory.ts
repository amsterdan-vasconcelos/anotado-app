"use server";

import type { ActionResult } from "@/lib/action-result";
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
          indexData.categories = indexData.categories.map((c: string) =>
            c === oldCategory ? newCategory : c,
          );
        }

        if (indexData.notes) {
          indexData.notes = indexData.notes.map((n: any) =>
            n.category === oldCategory ? { ...n, category: newCategory } : n,
          );
        }

        await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: "workspace-index.json",
          message: `refactor: renomear categoria ${oldCategory} → ${newCategory}`,
          content: Buffer.from(JSON.stringify(indexData, null, 2)).toString(
            "base64",
          ),
          sha: indexFile.sha,
        });
      }
    } catch (e) {
      console.error("[renameCategory] Erro ao atualizar index:", e);
    }

    // 2. Mover arquivos .md para a nova pasta
    try {
      const { data: files } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: oldCategory,
      });

      if (Array.isArray(files)) {
        for (const file of files) {
          if (file.type === "file" && file.name.endsWith(".md")) {
            const { data: fileData } = await octokit.rest.repos.getContent({
              owner,
              repo,
              path: file.path,
            });

            if (
              !Array.isArray(fileData) &&
              fileData.type === "file" &&
              fileData.content
            ) {
              const contentStr = Buffer.from(
                fileData.content,
                "base64",
              ).toString("utf-8");

              const updatedContent = contentStr.replace(
                new RegExp(`category:\\s*"${oldCategory}"`),
                `category: "${newCategory}"`,
              );

              await octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo,
                path: `${newCategory}/${file.name}`,
                message: `refactor: mover nota para categoria ${newCategory}`,
                content: Buffer.from(updatedContent).toString("base64"),
              });

              await octokit.rest.repos.deleteFile({
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
    } catch (e: any) {
      if (e.status !== 404) throw e;
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[renameCategory action]", error);
    return { success: false, error: "Erro ao renomear categoria." };
  }
}
