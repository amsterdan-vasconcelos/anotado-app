import { NextResponse } from "next/server";
import { getOctokit } from "@/lib/octokit";
import { getSessionForApi } from "@/lib/session";

const inviteCollaborator = async (request: Request) => {
  const { session, unauthorized } = await getSessionForApi();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { owner, workspace, username } = body;
    const repo = `anotado-${workspace}`;

    const octokit = getOctokit(session.accessToken || "");

    await octokit.rest.repos.addCollaborator({
      owner,
      repo,
      username,
      permission: "push",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/collaborators]", error);
    return NextResponse.json(
      { error: "Erro ao convidar usuário" },
      { status: 500 },
    );
  }
};

export { inviteCollaborator };
