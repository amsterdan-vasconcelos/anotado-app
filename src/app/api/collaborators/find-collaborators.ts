import { NextResponse } from "next/server";
import { getOctokit } from "@/lib/octokit";
import { getSessionForApi } from "@/lib/session";

const findCollaborators = async (request: Request) => {
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

  const octokit = getOctokit(session.accessToken || "");
  const repo = `anotado-${workspace}`;

  try {
    const { data: collaborators } = await octokit.rest.repos.listCollaborators({
      owner,
      repo,
    });

    return NextResponse.json(collaborators);
  } catch (error) {
    console.error("[GET /api/collaborators]", error);
    return NextResponse.json(
      { error: "Erro ao buscar colaboradores" },
      { status: 500 },
    );
  }
};

export { findCollaborators };
