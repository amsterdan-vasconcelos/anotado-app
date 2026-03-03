import { redirect } from "next/navigation";
import { getFileContent } from "@/lib/github/api/repos";
import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";
import { NoteViewerClient } from "@/modules/note/view/components/NoteViewerClient";

interface ViewNotePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ViewNotePage({
  searchParams,
}: ViewNotePageProps) {
  const { owner, workspace, category, slug } = await searchParams;
  const session = await getRequiredSession();

  if (
    typeof owner !== "string" ||
    typeof workspace !== "string" ||
    typeof category !== "string" ||
    typeof slug !== "string"
  ) {
    redirect(`/workspaces/unit?owner=${owner}&workspace=${workspace}`);
  }

  const octokit = getOctokit(session.accessToken || "");
  const repo = `anotado-${workspace}`;

  const file = await getFileContent(octokit, {
    owner,
    repo,
    path: `${category}/${slug}.md`,
  });

  if (!file) {
    redirect(`/workspaces/unit?owner=${owner}&workspace=${workspace}`);
  }

  const titleMatch = file.content.match(/title:\s*"(.*?)"/);
  const noteTitle = titleMatch ? titleMatch[1] : slug;

  const contentSplit = file.content.split("---");
  const noteContent =
    contentSplit.length > 2
      ? contentSplit.slice(2).join("---").trim()
      : file.content;

  return (
    <NoteViewerClient
      owner={owner}
      workspace={workspace}
      category={category}
      slug={slug}
      initialContent={noteContent}
      initialTitle={noteTitle}
    />
  );
}
