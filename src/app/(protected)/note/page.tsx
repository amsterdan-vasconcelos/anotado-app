import { redirect } from "next/navigation";
import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";
import { NoteViewerClient } from "@/modulos/note/NoteViewerClient";

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

  const fileRes = await octokit.rest.repos
    .getContent({ owner, repo, path: `${category}/${slug}.md` })
    .catch(() => null);

  if (!fileRes) {
    redirect(`/workspaces/unit?owner=${owner}&workspace=${workspace}`);
  }

  const fileData = fileRes.data;

  if (
    Array.isArray(fileData) ||
    fileData.type !== "file" ||
    !fileData.content
  ) {
    redirect(`/workspaces/unit?owner=${owner}&workspace=${workspace}`);
  }

  const decodedContent = Buffer.from(fileData.content, "base64").toString(
    "utf-8",
  );

  const titleMatch = decodedContent.match(/title:\s*"(.*?)"/);
  const noteTitle = titleMatch ? titleMatch[1] : slug;

  const contentSplit = decodedContent.split("---");
  const noteContent =
    contentSplit.length > 2
      ? contentSplit.slice(2).join("---").trim()
      : decodedContent;

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
