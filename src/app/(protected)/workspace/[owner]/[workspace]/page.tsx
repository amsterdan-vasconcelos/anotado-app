import { redirect } from "next/navigation";
import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";
import { formatDisplayName } from "@/lib/string-util";
import { WorkspaceHeader } from "./_components/workspace-header";
import { WorkspaceNotesViewer } from "./_components/workspace-notes-viewer";

interface WorkspacePageProps {
  params: Promise<{
    owner: string;
    workspace: string;
  }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { owner: ownerSlug, workspace: workspaceSlug } = await params;
  const session = await getRequiredSession();

  const repo = `anotado-${workspaceSlug}`;
  const octokit = getOctokit(session.accessToken || "");

  let notes = [];
  let displayName = formatDisplayName(workspaceSlug);

  const [repoRes, fileRes] = await Promise.allSettled([
    octokit.rest.repos.get({ owner: ownerSlug, repo }),
    octokit.rest.repos.getContent({
      owner: ownerSlug,
      repo,
      path: "workspace-index.json",
    }),
  ]);

  if (repoRes.status === "rejected") {
    redirect("/");
  }

  if (repoRes.status === "fulfilled") {
    const description = repoRes.value.data.description;
    const prefix = "Workspace gerado pelo app de anotações: ";
    if (description && description.startsWith(prefix)) {
      displayName = description.replace(prefix, "");
    }
  }

  if (
    fileRes.status === "fulfilled" &&
    !Array.isArray(fileRes.value.data) &&
    fileRes.value.data.type === "file" &&
    fileRes.value.data.content
  ) {
    const decodedContent = Buffer.from(
      fileRes.value.data.content,
      "base64",
    ).toString("utf-8");
    const parsedData = JSON.parse(decodedContent);
    notes = parsedData.notes ?? [];
  }

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen p-8">
      <main className="max-w-5xl mx-auto">
        <WorkspaceHeader
          owner={ownerSlug}
          workspaceSlug={workspaceSlug}
          displayName={displayName}
        />
        <WorkspaceNotesViewer
          notes={notes}
          owner={ownerSlug}
          workspace={workspaceSlug}
        />
      </main>
    </div>
  );
}
