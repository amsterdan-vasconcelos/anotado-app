import { NextResponse } from "next/server";
import { getOctokit } from "@/lib/octokit";
import { getSessionForApi } from "@/lib/session";

const updateCategory = async (request: Request) => {
  const { session, unauthorized } = await getSessionForApi();
  if (unauthorized) return unauthorized;

  try {
    const { owner, workspace, oldCategory, newCategory } = await request.json();
    const octokit = getOctokit(session.accessToken || "");
    const repo = `anotado-${workspace}`;

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
        const decodedIndex = Buffer.from(indexFile.content, "base64").toString(
          "utf-8",
        );
        const indexData = JSON.parse(decodedIndex);

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
      console.error("[PUT /api/categories] Erro ao atualizar index:", e);
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

              const updatedContentStr = contentStr.replace(
                new RegExp(`category:\\s*"${oldCategory}"`),
                `category: "${newCategory}"`,
              );

              // Cria no novo caminho
              await octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo,
                path: `${newCategory}/${file.name}`,
                message: `refactor: mover nota para categoria ${newCategory}`,
                content: Buffer.from(updatedContentStr).toString("base64"),
              });

              // Remove do caminho antigo
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
      // 404 significa que a categoria estava vazia — não há arquivos para mover
      if (e.status !== 404) throw e;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PUT /api/categories]", error);
    return NextResponse.json(
      { error: "Erro ao renomear categoria" },
      { status: 500 },
    );
  }
};

export { updateCategory };
