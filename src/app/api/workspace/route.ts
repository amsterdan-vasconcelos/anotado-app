import { NextResponse } from "next/server";
import { getOctokit } from "@/lib/octokit";
import { getSessionForApi } from "@/lib/session";
import { generateSlug } from "@/lib/string-util";

export async function POST(request: Request) {
  const { session, unauthorized } = await getSessionForApi();
  if (unauthorized) return unauthorized;

  try {
    const { name } = await request.json();
    const slug = generateSlug(name);

    const repoName = `anotado-${slug}`;

    const octokit = getOctokit(session.accessToken || "");
    const { data: user } = await octokit.rest.users.getAuthenticated();

    await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      private: true,
      auto_init: true,
      description: `Workspace gerado pelo app de anotações: ${name}`,
    });

    const initialIndex = {
      categories: ["geral"],
      notes: [],
    };

    const encodedContent = Buffer.from(
      JSON.stringify(initialIndex, null, 2),
    ).toString("base64");

    // Aguarda o GitHub finalizar a inicialização do repositório
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: user.login,
      repo: repoName,
      path: "workspace-index.json",
      message: "feat: setup inicial do workspace",
      content: encodedContent,
    });

    return NextResponse.json({ success: true, slug, owner: user.login });
  } catch (error) {
    console.error("[POST /api/workspaces]", error);
    return NextResponse.json(
      { error: "Erro ao criar workspace" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const { session, unauthorized } = await getSessionForApi();
  if (unauthorized) return unauthorized;

  try {
    const { owner, workspace } = await request.json();
    const octokit = getOctokit(session.accessToken || "");
    const repoName = `anotado-${workspace}`;

    await octokit.rest.repos.delete({
      owner,
      repo: repoName,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/workspaces]", error);
    return NextResponse.json(
      { error: "Erro ao excluir workspace" },
      { status: 500 },
    );
  }
}
