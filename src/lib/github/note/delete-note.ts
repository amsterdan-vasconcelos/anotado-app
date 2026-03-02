import { getOctokit } from "../../octokit";
import {
  createCommit,
  createTree,
  getBranchRef,
  getCommit,
  updateBranchRef,
} from "../api/git";
import { getFileContent } from "../api/repos";

export async function deleteNoteCommit(
  token: string,
  owner: string,
  workspace: string,
  category: string,
  slug: string,
) {
  const octokit = getOctokit(token);
  const repo = `anotado-${workspace}`;

  // ── Passo 1: branch padrão ───────────────────────────────────────────────────
  const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
  const defaultBranch = repoData.default_branch;

  // ── Passo 2 (paralelo): ref + index — economiza 1 round-trip ────────────────
  const [refRes, indexFileRes] = await Promise.allSettled([
    getBranchRef(octokit, { owner, repo, branch: defaultBranch }),
    getFileContent(octokit, { owner, repo, path: "workspace-index.json" }),
  ]);

  if (refRes.status === "rejected") {
    throw new Error("REF_NOT_FOUND");
  }

  const { commitSha: latestCommitSha } = refRes.value;

  const { treeSha: baseTreeSha } = await getCommit(octokit, {
    owner,
    repo,
    commitSha: latestCommitSha,
  });

  // ── Atualiza o índice removendo a nota ───────────────────────────────────────
  let indexData = { categories: ["geral"], notes: [] as any[] };

  if (indexFileRes.status === "fulfilled" && indexFileRes.value !== null) {
    indexData = JSON.parse(indexFileRes.value.content);
  }

  if (!indexData.categories) indexData.categories = ["geral"];

  indexData.notes = indexData.notes.filter(
    (note: any) => !(note.slug === slug && note.category === category),
  );

  // ── Cria tree com o arquivo de nota deletado (sha: null) ─────────────────────
  const { treeSha } = await createTree(octokit, {
    owner,
    repo,
    baseTreeSha,
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

  const { commitSha } = await createCommit(octokit, {
    owner,
    repo,
    message: `chore: excluir nota ${slug}`,
    treeSha,
    parentShas: [latestCommitSha],
  });

  await updateBranchRef(octokit, {
    owner,
    repo,
    branch: defaultBranch,
    commitSha,
  });
}
