import { getOctokit } from "../../octokit";

interface NotePayload {
  title: string;
  category: string;
  content: string;
  slug: string;
  date: string;
  sha?: string;
}

export async function createNoteCommit(
  token: string,
  owner: string,
  workspace: string,
  note: NotePayload,
) {
  const octokit = getOctokit(token);
  const repo = `anotado-${workspace}`;

  // Paralelo: info do repo + index
  console.log("Iniciando criação de nota:", { owner, workspace, note });
  const [repoInfoRes, fileRes] = await Promise.allSettled([
    octokit.rest.repos.get({ owner, repo }),
    octokit.rest.repos.getContent({
      owner,
      repo,
      path: "workspace-index.json",
    }),
  ]);

  console.log("Repo info result:", repoInfoRes);
  if (repoInfoRes.status === "rejected") {
    throw new Error("WORKSPACE_NOT_FOUND");
  }

  const defaultBranch = repoInfoRes.value.data.default_branch || "main";
  let indexData = { categories: ["geral"], notes: [] as any[] };

  if (
    fileRes.status === "fulfilled" &&
    !Array.isArray(fileRes.value.data) &&
    fileRes.value.data.type === "file" &&
    fileRes.value.data.content
  ) {
    const decoded = Buffer.from(fileRes.value.data.content, "base64").toString(
      "utf-8",
    );
    indexData = JSON.parse(decoded);
  }

  const slugExists = indexData.notes.some((n: any) => n.slug === note.slug);
  if (slugExists) {
    throw new Error("SLUG_ALREADY_EXISTS");
  }

  if (!indexData.categories.includes(note.category)) {
    indexData.categories.push(note.category);
  }

  indexData.notes.push({
    slug: note.slug,
    title: note.title,
    category: note.category,
    date: note.date,
  });

  const indexString = JSON.stringify(indexData, null, 2);
  const mdString = `---\ntitle: "${note.title}"\ndate: "${note.date}"\ncategory: "${note.category}"\n---\n\n${note.content}`;

  let isEmptyRepo = false;
  let latestCommitSha: string | null = null;
  let baseTreeSha: string | null = null;

  try {
    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });
    latestCommitSha = refData.object.sha;

    const { data: commitData } = await octokit.rest.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha,
    });
    baseTreeSha = commitData.tree.sha;
  } catch {
    isEmptyRepo = true;
  }

  if (isEmptyRepo) {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: "workspace-index.json",
      message: "feat: inicializar workspace",
      content: Buffer.from(indexString).toString("base64"),
    });

    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: `${note.category}/${note.slug}.md`,
      message: `feat: criar nota ${note.title}`,
      content: Buffer.from(mdString).toString("base64"),
    });

    return;
  }

  const { data: newTree } = await octokit.rest.git.createTree({
    owner,
    repo,
    base_tree: baseTreeSha!,
    tree: [
      {
        path: "workspace-index.json",
        mode: "100644",
        type: "blob",
        content: indexString,
      },
      {
        path: `${note.category}/${note.slug}.md`,
        mode: "100644",
        type: "blob",
        content: mdString,
      },
    ],
  });

  const { data: newCommit } = await octokit.rest.git.createCommit({
    owner,
    repo,
    message: `feat: criar nota ${note.title}`,
    tree: newTree.sha,
    parents: [latestCommitSha!],
  });

  await octokit.rest.git.updateRef({
    owner,
    repo,
    ref: `heads/${defaultBranch}`,
    sha: newCommit.sha,
  });
}
