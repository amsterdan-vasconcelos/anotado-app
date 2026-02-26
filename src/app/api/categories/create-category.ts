import { NextResponse } from "next/server";
import { getOctokit } from "@/lib/octokit";
import { getSessionForApi } from "@/lib/session";

const createCategory = async (request: Request) => {
  const { session, unauthorized } = await getSessionForApi();
  if (unauthorized) return unauthorized;

  try {
    const { owner, workspace, category } = await request.json();

    if (!owner || !workspace || !category) {
      return NextResponse.json(
        { error: "Parâmetros inválidos" },
        { status: 400 },
      );
    }

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
      const decodedIndex = Buffer.from(indexFile.content, "base64").toString(
        "utf-8",
      );
      const indexData = JSON.parse(decodedIndex);

      if (!indexData.categories) indexData.categories = ["geral"];

      if (indexData.categories.includes(category)) {
        return NextResponse.json(
          { error: "Essa categoria já existe." },
          { status: 409 },
        );
      }

      indexData.categories.push(category);

      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: "workspace-index.json",
        message: `feat: adicionar categoria ${category}`,
        content: Buffer.from(JSON.stringify(indexData, null, 2)).toString(
          "base64",
        ),
        sha: indexFile.sha,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Arquivo de índice não encontrado." },
      { status: 404 },
    );
  } catch (error) {
    console.error("[POST /api/categories]", error);
    return NextResponse.json(
      { error: "Erro ao criar categoria" },
      { status: 500 },
    );
  }
};

export { createCategory };
