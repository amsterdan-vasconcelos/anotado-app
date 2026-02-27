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

  if (!owner || !workspace || !path) {
    return NextResponse.json(
      { error: "Parâmetros inválidos" },
      { status: 400 },
    );
  }

  const octokit = getOctokit(session.accessToken || "");
  const repo = `anotado-${workspace}`;

  try {
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      path,
    });

    const formattedCommits = commits.map((item) => ({
      sha: item.sha,
      message: item.commit.message,
      date: item.commit.author?.date,
      authorName: item.commit.author?.name,
      authorAvatar: item.author?.avatar_url,
    }));

    return NextResponse.json(formattedCommits);
  } catch (error) {
    console.error("[GET /api/history]", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico" },
      { status: 500 },
    );
  }
}
