import { getOctokit } from "../../octokit";

export async function deleteNoteCommit(
  token: string,
  owner: string,
  workspace: string,
  category: string,
  slug: string,
) {
  const octokit = getOctokit(token);
  const repo = `anotado-${workspace}`;

  // Passo 1: buscar branch padrão
  const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
  const defaultBranch = repoData.default_branch;

  // Passo 2 (paralelo): ref do branch + conteúdo do index — economiza 1 round-trip
  const [refRes, indexRes] = await Promise.allSettled([
    octokit.rest.git.getRef({ owner, repo, ref: `heads/${defaultBranch}` }),
    octokit.rest.repos.getContent({
      owner,
      repo,
      path: "workspace-index.json",
      ref: defaultBranch,
    }),
  ]);

  if (refRes.status === "rejected") {
    throw new Error("REF_NOT_FOUND");
  }

  const latestCommitSha = refRes.value.data.object.sha;

  const { data: commitData } = await octokit.rest.git.getCommit({
    owner,
    repo,
    commit_sha: latestCommitSha,
  });
  const baseTreeSha = commitData.tree.sha;

  let indexData = { categories: ["geral"], notes: [] as any[] };

  if (indexRes.status === "fulfilled") {
    const fileData = indexRes.value.data;
    if (
      !Array.isArray(fileData) &&
      fileData.type === "file" &&
      fileData.content
    ) {
      const decoded = Buffer.from(fileData.content, "base64").toString("utf-8");
      indexData = JSON.parse(decoded);
    }
  }

  if (!indexData.categories) indexData.categories = ["geral"];
  indexData.notes = indexData.notes.filter(
    (note: any) => !(note.slug === slug && note.category === category),
  );

  // Usa content inline na tree (sem createBlob separado — economiza 1 chamada)
  const { data: newTree } = await octokit.rest.git.createTree({
    owner,
    repo,
    base_tree: baseTreeSha,
    tree: [
      {
        path: "workspace-index.json",
        mode: "100644",
        type: "blob",
        content: JSON.stringify(indexData, null, 2),
      },
      {
        path: `${category}/${slug}.md`,
        mode: "100644",
        type: "blob",
        sha: null,
      },
    ],
  });

  const { data: newCommit } = await octokit.rest.git.createCommit({
    owner,
    repo,
    message: `chore: excluir nota ${slug}`,
    tree: newTree.sha,
    parents: [latestCommitSha],
  });

  await octokit.rest.git.updateRef({
    owner,
    repo,
    ref: `heads/${defaultBranch}`,
    sha: newCommit.sha,
  });
}
