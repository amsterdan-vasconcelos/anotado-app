import type { Octokit } from "octokit";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Um item de tree do Git.
 *
 * Para criar/atualizar um arquivo: passe `content` (UTF-8 plain text).
 * Para deletar um arquivo: passe `sha: null` e omita `content`.
 * Para apontar para um blob existente: passe apenas `sha` (string).
 */
export interface GitTreeItem {
  path: string;
  mode: "100644" | "100755" | "040000" | "160000" | "120000";
  type: "blob" | "tree" | "commit";
  /** Conteúdo inline em UTF-8. Mutuamente exclusivo com `sha`. */
  content?: string;
  /**
   * SHA de um blob existente.
   * Passe `null` para deletar o arquivo da tree.
   */
  sha?: string | null;
}

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Retorna o SHA do commit mais recente de um branch.
 *
 * @example
 * const { commitSha } = await getBranchRef(octokit, { owner, repo, branch: "main" });
 */
export async function getBranchRef(
  octokit: Octokit,
  params: { owner: string; repo: string; branch: string },
): Promise<{ commitSha: string }> {
  const { data } = await octokit.rest.git.getRef({
    owner: params.owner,
    repo: params.repo,
    ref: `heads/${params.branch}`,
  });

  return { commitSha: data.object.sha };
}

/**
 * Retorna o SHA da tree de um commit.
 * Necessário como `baseTreeSha` ao chamar `createTree`.
 *
 * @example
 * const { treeSha } = await getCommit(octokit, { owner, repo, commitSha });
 */
export async function getCommit(
  octokit: Octokit,
  params: { owner: string; repo: string; commitSha: string },
): Promise<{ treeSha: string }> {
  const { data } = await octokit.rest.git.getCommit({
    owner: params.owner,
    repo: params.repo,
    commit_sha: params.commitSha,
  });

  return { treeSha: data.tree.sha };
}

/**
 * Cria uma nova tree a partir de uma tree base, aplicando as alterações
 * descritas em `tree`.
 *
 * Arquivos não listados em `tree` são preservados da `baseTreeSha`.
 * Para deletar um arquivo, inclua seu item com `sha: null`.
 *
 * @returns SHA da nova tree criada.
 */
export async function createTree(
  octokit: Octokit,
  params: {
    owner: string;
    repo: string;
    baseTreeSha: string;
    tree: GitTreeItem[];
  },
): Promise<{ treeSha: string }> {
  const { data } = await octokit.rest.git.createTree({
    owner: params.owner,
    repo: params.repo,
    base_tree: params.baseTreeSha,
    tree: params.tree,
  });

  return { treeSha: data.sha };
}

/**
 * Cria um novo objeto de commit apontando para uma tree e com os commits
 * listados como parents.
 *
 * Para um commit normal passe um único `parentSha`.
 * Para o primeiro commit de um repositório vazio passe `parentShas: []`.
 *
 * @returns SHA do commit criado.
 */
export async function createCommit(
  octokit: Octokit,
  params: {
    owner: string;
    repo: string;
    message: string;
    treeSha: string;
    parentShas: string[];
  },
): Promise<{ commitSha: string }> {
  const { data } = await octokit.rest.git.createCommit({
    owner: params.owner,
    repo: params.repo,
    message: params.message,
    tree: params.treeSha,
    parents: params.parentShas,
  });

  return { commitSha: data.sha };
}

/**
 * Avança um branch para apontar para um novo commit SHA (fast-forward).
 * Equivalente a `git update-ref refs/heads/<branch> <commitSha>`.
 */
export async function updateBranchRef(
  octokit: Octokit,
  params: { owner: string; repo: string; branch: string; commitSha: string },
): Promise<void> {
  await octokit.rest.git.updateRef({
    owner: params.owner,
    repo: params.repo,
    ref: `heads/${params.branch}`,
    sha: params.commitSha,
  });
}
