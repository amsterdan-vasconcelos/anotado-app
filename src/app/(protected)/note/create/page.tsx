import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";
import { CreateNoteClient } from "@/modulos/note/create/components/CreateNoteClient";

interface CreateNotePageProps {
  params: Promise<{
    owner: string;
    workspace: string;
  }>;
}

const CreateNotePage = async ({ params }: CreateNotePageProps) => {
  const { owner, workspace } = await params;
  const session = await getRequiredSession();

  const octokit = getOctokit(session.accessToken || "");
  const repo = `anotado-${workspace}`;

  let categories = ["geral"];

  const indexRes = await octokit.rest.repos
    .getContent({ owner, repo, path: "workspace-index.json" })
    .catch(() => null);

  if (indexRes) {
    const fileData = indexRes.data;
    if (
      !Array.isArray(fileData) &&
      fileData.type === "file" &&
      fileData.content
    ) {
      const decodedContent = Buffer.from(fileData.content, "base64").toString(
        "utf-8",
      );
      const parsedData = JSON.parse(decodedContent);
      if (parsedData.categories && Array.isArray(parsedData.categories)) {
        categories = parsedData.categories;
      }
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
