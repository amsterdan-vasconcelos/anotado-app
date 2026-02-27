import { getOctokit } from "../../octokit";

interface NotePayload {
  title: string;
  category: string;
  content: string;
  slug: string;
  date: string;
  sha?: string;
}

export async function updateNoteCommit(
  token: string,
  owner: string,
  workspace: string,
  oldCategory: string,
  oldSlug: string,
  note: NotePayload,
) {
  const octokit = getOctokit(token);
  const repo = `anotado-${workspace}`;

  // Paralelo: info do repo + index + arquivo atual (para detecção de conflito)
  const [repoInfoRes, fileRes, currentFileRes] = await Promise.allSettled([
    octokit.rest.repos.get({ owner, repo }),
    octokit.rest.repos.getContent({
      owner,
      repo,
      path: "workspace-index.json",
    }),
    octokit.rest.repos.getContent({
      owner,
      repo,
      path: `${oldCategory}/${oldSlug}.md`,
    }),
  ]);

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

  // Detecção real de conflito usando o arquivo já buscado em paralelo
  if (note.sha && currentFileRes.status === "fulfilled") {
    const currentFile = currentFileRes.value.data;
    if (
      !Array.isArray(currentFile) &&
      currentFile.type === "file" &&
      currentFile.sha !== note.sha
    ) {
      const decodedRemote = Buffer.from(
        currentFile.content ?? "",
        "base64",
      ).toString("utf-8");
      const parts = decodedRemote.split("---");
      const remoteContent =
        parts.length > 2 ? parts.slice(2).join("---").trim() : decodedRemote;

      const conflict = new Error("CONFLICT") as Error & {
        status: number;
        remoteContent: string;
        latestSha: string;
      };
      conflict.status = 409;
      conflict.remoteContent = remoteContent;
      conflict.latestSha = currentFile.sha;
      throw conflict;
    }
  }

  const slugExists = indexData.notes.some(
    (n: any) => n.slug === note.slug && n.slug !== oldSlug,
  );
  if (slugExists) {
    throw new Error("SLUG_ALREADY_EXISTS");
  }

  if (!indexData.categories.includes(note.category)) {
    indexData.categories.push(note.category);
  }

  indexData.notes = indexData.notes.filter(
    (n: any) => !(n.slug === oldSlug && n.category === oldCategory),
  );
  indexData.notes.push({
    slug: note.slug,
    title: note.title,
    category: note.category,
    date: note.date,
  });

  const indexString = JSON.stringify(indexData, null, 2);
  const mdString = `---\ntitle: "${note.title}"\ndate: "${note.date}"\ncategory: "${note.category}"\n---\n\n${note.content}`;

  const { data: refData } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${defaultBranch}`,
  });
  const latestCommitSha = refData.object.sha;

  const { data: commitData } = await octokit.rest.git.getCommit({
    owner,
    repo,
    commit_sha: latestCommitSha,
  });
  const baseTreeSha = commitData.tree.sha;

  const tree: any[] = [
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
  ];

  const oldPath = `${oldCategory}/${oldSlug}.md`;
  const newPath = `${note.category}/${note.slug}.md`;

  if (oldPath !== newPath) {
    tree.push({ path: oldPath, mode: "100644", type: "blob", sha: null });
  }

  const { data: newTree } = await octokit.rest.git.createTree({
    owner,
    repo,
    base_tree: baseTreeSha,
    tree,
  });

  const { data: newCommit } = await octokit.rest.git.createCommit({
    owner,
    repo,
    message: `refactor: atualizar nota ${note.title}`,
    tree: newTree.sha,
    parents: [latestCommitSha],
  });

  const finalResponse = await octokit.rest.git.updateRef({
    owner,
    repo,
    ref: `heads/${defaultBranch}`,
    sha: newCommit.sha,
  });

  const rateLimit = finalResponse.headers["x-ratelimit-remaining"];
  console.log(`[GitHub API] Rate limit restante: ${rateLimit}/5000`);
}
