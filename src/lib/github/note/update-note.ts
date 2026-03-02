import { getOctokit } from "../../octokit";
import {
  createCommit,
  createTree,
  type GitTreeItem,
  getBranchRef,
  getCommit,
  updateBranchRef,
} from "../api/git";
import { getFileContent } from "../api/repos";

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

  // ── Paralelo: info do repo + index + arquivo atual (detecção de conflito) ────
  const [repoInfoRes, indexFileRes, currentFileRes] = await Promise.allSettled([
    octokit.rest.repos.get({ owner, repo }),
    getFileContent(octokit, { owner, repo, path: "workspace-index.json" }),
    getFileContent(octokit, {
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

  if (indexFileRes.status === "fulfilled" && indexFileRes.value !== null) {
    indexData = JSON.parse(indexFileRes.value.content);
  }

  // ── Detecção de conflito usando o SHA do arquivo atual ───────────────────────
  if (
    note.sha &&
    currentFileRes.status === "fulfilled" &&
    currentFileRes.value !== null
  ) {
    const currentFile = currentFileRes.value;

    if (currentFile.sha !== note.sha) {
      // O arquivo foi modificado por outra pessoa desde que o usuário abriu a edição
      const parts = currentFile.content.split("---");
      const remoteContent =
        parts.length > 2
          ? parts.slice(2).join("---").trim()
          : currentFile.content;

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

  // ── Atualiza o índice ────────────────────────────────────────────────────────
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

  // ── Git plumbing: busca o commit atual do branch ─────────────────────────────
  const { commitSha: latestCommitSha } = await getBranchRef(octokit, {
    owner,
    repo,
    branch: defaultBranch,
  });

  const { treeSha: baseTreeSha } = await getCommit(octokit, {
    owner,
    repo,
    commitSha: latestCommitSha,
  });

  // ── Monta a tree com os arquivos alterados ───────────────────────────────────
  const tree: GitTreeItem[] = [
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

  // Se a nota foi movida de categoria ou renomeada, remove o arquivo antigo
  if (oldPath !== newPath) {
    tree.push({ path: oldPath, mode: "100644", type: "blob", sha: null });
  }

  const { treeSha } = await createTree(octokit, {
    owner,
    repo,
    baseTreeSha,
    tree,
  });

  const { commitSha } = await createCommit(octokit, {
    owner,
    repo,
    message: `refactor: atualizar nota ${note.title}`,
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
