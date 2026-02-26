import { NextResponse } from "next/server";
import { getOctokit } from "@/lib/octokit";
import { getSessionForApi } from "@/lib/session";

const deleteCategory = async (request: Request) => {
  const { session, unauthorized } = await getSessionForApi();
  if (unauthorized) return unauthorized;

  try {
    const { owner, workspace, category } = await request.json();
    const octokit = getOctokit(session.accessToken || "");
    const repo = `anotado-${workspace}`;

    // 1. Remover categoria do workspace-index.json
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
        const decodedIndex = Buffer.from(indexFile.content, "base64").toString(
          "utf-8",
        );
        const indexData = JSON.parse(decodedIndex);

        if (indexData.categories) {
          indexData.categories = indexData.categories.filter(
            (c: string) => c !== category,
          );
        }

        if (indexData.notes) {
          indexData.notes = indexData.notes.filter(
            (n: any) => n.category !== category,
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
    } catch (e) {
      console.error("[DELETE /api/categories] Erro ao atualizar index:", e);
    }

    // 2. Deletar todos os arquivos da categoria
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
    } catch (e: any) {
      if (e.status !== 404) throw e;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/categories]", error);
    return NextResponse.json(
      { error: "Erro ao excluir categoria" },
      { status: 500 },
    );
  }
};

export { deleteCategory };
