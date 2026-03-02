import { getFileContent } from "@/lib/github/api/repos";
import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";
import { CreateNoteClient } from "@/modules/note/create/components/CreateNoteClient";

interface CreateNotePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const CreateNotePage = async ({ searchParams }: CreateNotePageProps) => {
  const { owner, workspace } = await searchParams;
  const session = await getRequiredSession();

  if (typeof owner !== "string" || typeof workspace !== "string") {
    throw new Error("Erro ao criar nota!");
  }

  const octokit = getOctokit(session.accessToken || "");
  const repo = `anotado-${workspace}`;

  let categories = ["geral"];

  const indexFile = await getFileContent(octokit, {
    owner,
    repo,
    path: "workspace-index.json",
  });

  if (indexFile) {
    const parsedData = JSON.parse(indexFile.content);
    if (parsedData.categories && Array.isArray(parsedData.categories)) {
      categories = parsedData.categories;
    }
  }

  return (
    <CreateNoteClient
      owner={owner}
      workspace={workspace}
      categories={categories}
    />
  );
};

export default CreateNotePage;
