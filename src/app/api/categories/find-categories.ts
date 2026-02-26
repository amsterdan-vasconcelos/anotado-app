import { NextResponse } from "next/server";
import { getOctokit } from "@/lib/octokit";
import { getSessionForApi } from "@/lib/session";

const findCategories = async (request: Request) => {
  const { session, unauthorized } = await getSessionForApi();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const workspace = searchParams.get("workspace");

  if (!owner || !workspace) {
    return NextResponse.json(
      { error: "Parâmetros inválidos" },
      { status: 400 },
    );
  }

  try {
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
      return NextResponse.json({
        categories: indexData.categories ?? ["geral"],
      });
    }

    return NextResponse.json({ categories: ["geral"] });
  } catch (error) {
    console.error("[GET /api/categories]", error);
    return NextResponse.json(
      { error: "Erro ao buscar categorias" },
      { status: 500 },
    );
  }
};

export { findCategories };
