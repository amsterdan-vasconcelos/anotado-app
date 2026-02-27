import { redirect } from "next/navigation";
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

  const [fileRes, indexRes] = await Promise.allSettled([
    octokit.rest.repos.getContent({
      owner,
      repo,
      path: `${category}/${slug}.md`,
    }),
    octokit.rest.repos.getContent({
      owner,
      repo,
      path: "workspace-index.json",
    }),
  ]);

  if (
    fileRes.status === "rejected" ||
    Array.isArray(fileRes.value.data) ||
    fileRes.value.data.type !== "file" ||
    !fileRes.value.data.content
  ) {
    redirect(
      `/workspace?owner=${owner}&workspace=${workspace}&${category}=${slug}`,
    );
  }

  const fileData = fileRes.value.data;
  const decodedContent = Buffer.from(fileData.content, "base64").toString(
    "utf-8",
  );

  const fileSha = fileData.sha;

  const titleMatch = decodedContent.match(/title:\s*"(.*?)"/);
  const noteTitle = titleMatch ? titleMatch[1] : slug;

  const contentSplit = decodedContent.split("---");
  const noteContent =
    contentSplit.length > 2
      ? contentSplit.slice(2).join("---").trim()
      : decodedContent;

  let categories = ["geral"];

  if (
    indexRes.status === "fulfilled" &&
    !Array.isArray(indexRes.value.data) &&
    indexRes.value.data.type === "file" &&
    indexRes.value.data.content
  ) {
    const decodedIndex = Buffer.from(
      indexRes.value.data.content,
      "base64",
    ).toString("utf-8");
    const parsedData = JSON.parse(decodedIndex);
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
