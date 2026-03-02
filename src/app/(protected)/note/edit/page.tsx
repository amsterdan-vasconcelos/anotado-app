import { redirect } from "next/navigation";
import { getFileContent } from "@/lib/github/api/repos";
import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";
import { EditNoteClient } from "@/modulos/note/edit/EditNoteClient";

interface EditNotePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditNotePage({
  searchParams,
}: EditNotePageProps) {
  const { owner, workspace, category, slug } = await searchParams;
  const session = await getRequiredSession();

  if (
    typeof owner !== "string" ||
    typeof workspace !== "string" ||
    typeof category !== "string" ||
    typeof slug !== "string"
  ) {
    redirect(
      `/note?owner=${owner}&workspace=${workspace}&category=${category}&slug=${slug}`,
    );
  }

  const octokit = getOctokit(session.accessToken || "");
  const repo = `anotado-${workspace}`;

  const [noteFileRes, indexFileRes] = await Promise.allSettled([
    getFileContent(octokit, { owner, repo, path: `${category}/${slug}.md` }),
    getFileContent(octokit, { owner, repo, path: "workspace-index.json" }),
  ]);

  if (noteFileRes.status === "rejected" || noteFileRes.value === null) {
    redirect(
      `/note?owner=${owner}&workspace=${workspace}&category=${category}&slug=${slug}`,
    );
  }

  const noteFile = noteFileRes.value;
  const fileSha = noteFile.sha;

  const titleMatch = noteFile.content.match(/title:\s*"(.*?)"/);
  const noteTitle = titleMatch ? titleMatch[1] : slug;

  const contentSplit = noteFile.content.split("---");
  const noteContent =
    contentSplit.length > 2
      ? contentSplit.slice(2).join("---").trim()
      : noteFile.content;

  let categories = ["geral"];

  if (indexFileRes.status === "fulfilled" && indexFileRes.value !== null) {
    const parsedData = JSON.parse(indexFileRes.value.content);
    if (parsedData.categories && Array.isArray(parsedData.categories)) {
      categories = parsedData.categories;
    }
  }

  const initialData = {
    title: noteTitle,
    category,
    content: noteContent,
  };

  return (
    <EditNoteClient
      owner={owner}
      workspace={workspace}
      oldCategory={category}
      oldSlug={slug}
      categories={categories}
      initialData={initialData}
      sha={fileSha}
    />
  );
}
