import { redirect } from "next/navigation";
import { getFileContent, getRepo } from "@/lib/github/api/repos";
import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";
import { formatDisplayName } from "@/lib/string-util";
import { WorkspaceHeader } from "@/modules/workspace/components/header";
import { WorkspaceNotesViewer } from "@/modules/workspace/components/notes-list";

interface WorkspacePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function WorkspacePage({
  searchParams,
}: WorkspacePageProps) {
  const session = await getRequiredSession();
  const { owner: ownerSlug, workspace: workspaceSlug } = await searchParams;

  if (typeof ownerSlug !== "string" || typeof workspaceSlug !== "string") {
    redirect("/workspaces");
  }

  const repo = `anotado-${workspaceSlug}`;
  const octokit = getOctokit(session.accessToken || "");

  let notes = [];
  let displayName = formatDisplayName(workspaceSlug);

  const [repoInfoRes, indexFileRes] = await Promise.allSettled([
    getRepo(octokit, { owner: ownerSlug, repo }),
    getFileContent(octokit, {
      owner: ownerSlug,
      repo,
      path: "workspace-index.json",
    }),
  ]);

  if (repoInfoRes.status === "rejected") {
    redirect("/workspaces");
  }

  const prefix = "Workspace gerado pelo app de anotações: ";
  const description = repoInfoRes.value.description;
  if (description?.startsWith(prefix)) {
    displayName = description.replace(prefix, "");
  }

  if (indexFileRes.status === "fulfilled" && indexFileRes.value !== null) {
    const parsedData = JSON.parse(indexFileRes.value.content);
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
