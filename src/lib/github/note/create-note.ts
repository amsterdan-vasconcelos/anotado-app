import { getOctokit } from "../../octokit";
import {
  createCommit,
  createTree,
  getBranchRef,
  getCommit,
  updateBranchRef,
} from "../api/git";
import { getFileContent, upsertFile } from "../api/repos";

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

  // ── Paralelo: info do repo + index ──────────────────────────────────────────
  const [repoInfoRes, indexFileRes] = await Promise.allSettled([
    octokit.rest.repos.get({ owner, repo }),
    getFileContent(octokit, { owner, repo, path: "workspace-index.json" }),
  ]);

  if (repoInfoRes.status === "rejected") {
    throw new Error("WORKSPACE_NOT_FOUND");
  }

  const defaultBranch = repoInfoRes.value.data.default_branch || "main";
  let indexData = { categories: ["geral"], notes: [] as any[] };

  if (indexFileRes.status === "fulfilled" && indexFileRes.value !== null) {
    indexData = JSON.parse(indexFileRes.value.content);
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

  // ── Tenta buscar o branch atual — detecta repo vazio ────────────────────────
  let isEmptyRepo = false;
  let latestCommitSha: string | null = null;
  let baseTreeSha: string | null = null;

  try {
    const ref = await getBranchRef(octokit, {
      owner,
      repo,
      branch: defaultBranch,
    });
    latestCommitSha = ref.commitSha;

    const commit = await getCommit(octokit, {
      owner,
      repo,
      commitSha: latestCommitSha,
    });
    baseTreeSha = commit.treeSha;
  } catch {
    isEmptyRepo = true;
  }

  // ── Repo vazio: fallback para upsertFile simples ─────────────────────────────
  if (isEmptyRepo) {
    await upsertFile(octokit, {
      owner,
      repo,
      path: "workspace-index.json",
      message: "feat: inicializar workspace",
      content: indexString,
    });

    await upsertFile(octokit, {
      owner,
      repo,
      path: `${note.category}/${note.slug}.md`,
      message: `feat: criar nota ${note.title}`,
      content: mdString,
    });

    return;
  }

  // ── Caminho normal: commit via Git plumbing (1 commit, 2 arquivos) ───────────
  const { treeSha } = await createTree(octokit, {
    owner,
    repo,
    baseTreeSha: baseTreeSha!,
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

  const { commitSha } = await createCommit(octokit, {
    owner,
    repo,
    message: `feat: criar nota ${note.title}`,
    treeSha,
    parentShas: [latestCommitSha!],
  });

  await updateBranchRef(octokit, {
    owner,
    repo,
    branch: defaultBranch,
    commitSha,
  });
}
