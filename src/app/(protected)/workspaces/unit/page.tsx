import { redirect } from "next/navigation";
import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";
import { formatDisplayName } from "@/lib/string-util";
import { WorkspaceHeader } from "@/modulos/workspace/components/header";
import { WorkspaceNotesViewer } from "@/modulos/workspace/components/notes-list";

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

  const [repoRes, fileRes] = await Promise.allSettled([
    octokit.rest.repos.get({ owner: ownerSlug, repo }),
    octokit.rest.repos.getContent({
      owner: ownerSlug,
      repo,
      path: "workspace-index.json",
    }),
  ]);

  if (repoRes.status === "rejected") {
    redirect("/workspaces");
  }

  if (repoRes.status === "fulfilled") {
    const description = repoRes.value.data.description;
    const prefix = "Workspace gerado pelo app de anotações: ";
    if (!!description && description.startsWith(prefix)) {
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
