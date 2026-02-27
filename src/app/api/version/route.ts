import { NextResponse } from "next/server";
import { getOctokit } from "@/lib/octokit";
import { getSessionForApi } from "@/lib/session";

export async function GET(request: Request) {
  const { session, unauthorized } = await getSessionForApi();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const workspace = searchParams.get("workspace");
  const path = searchParams.get("path");
  const ref = searchParams.get("ref");

  if (!owner || !workspace || !path || !ref) {
    return NextResponse.json(
      { error: "Parâmetros inválidos" },
      { status: 400 },
    );
  }

  const octokit = getOctokit(session.accessToken || "");
  const repo = `anotado-${workspace}`;

  try {
    const { data: fileData } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    if (
      !Array.isArray(fileData) &&
      fileData.type === "file" &&
      fileData.content
    ) {
      const decodedContent = Buffer.from(fileData.content, "base64").toString(
        "utf-8",
      );
      return NextResponse.json({ content: decodedContent });
    }

    return NextResponse.json(
      { error: "Formato de arquivo inválido" },
      { status: 422 },
    );
  } catch (error) {
    console.error("[GET /api/version]", error);
    return NextResponse.json(
      { error: "Erro ao buscar versão" },
      { status: 500 },
    );
  }
}
