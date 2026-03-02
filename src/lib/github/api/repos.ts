import type { Octokit } from "octokit";
import type { WorkspaceRepo } from "@/types/github";

// ─── Return types ─────────────────────────────────────────────────────────────

/** Metadados básicos de um repositório. */
export interface RepoInfo {
  defaultBranch: string;
  description: string | null;
}

/**
 * Conteúdo de um arquivo.
 * O campo `content` já vem decodificado (UTF-8), não em base64.
 */
export interface FileContent {
  content: string;
  sha: string;
}

/** Um item (arquivo ou subdiretório) dentro de um diretório. */
export interface DirectoryEntry {
  type: string;
  name: string;
  path: string;
  sha: string;
}

/** Resumo de um commit para exibição no histórico. */
export interface CommitSummary {
  sha: string;
  message: string;
  date: string;
  authorName: string;
  authorAvatar: string | undefined;
}

/** Um colaborador de um repositório. */
export interface CollaboratorEntry {
  id: number;
  login: string;
  avatarUrl: string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function decodeBase64(encoded: string): string {
  return Buffer.from(encoded, "base64").toString("utf-8");
}

function encodeBase64(plain: string): string {
  return Buffer.from(plain).toString("base64");
}

// ─── Repo ─────────────────────────────────────────────────────────────────────

/**
 * Busca metadados básicos de um repositório.
 * Lança erro se o repositório não existir.
 */
export async function getRepo(
  octokit: Octokit,
  params: { owner: string; repo: string },
): Promise<RepoInfo> {
  const { data } = await octokit.rest.repos.get(params);
  return {
    defaultBranch: data.default_branch,
    description: data.description ?? null,
  };
}

/**
 * Busca o conteúdo de um arquivo no repositório.
 * Retorna `null` se o arquivo não existir (404).
 * O campo `content` já vem decodificado (UTF-8).
 */
export async function getFileContent(
  octokit: Octokit,
  params: { owner: string; repo: string; path: string; ref?: string },
): Promise<FileContent | null> {
  try {
    const { data } = await octokit.rest.repos.getContent(params);

    if (Array.isArray(data) || data.type !== "file" || !data.content) {
      return null;
    }

    return {
      content: decodeBase64(data.content),
      sha: data.sha,
    };
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}

/**
 * Lista os itens de um diretório no repositório.
 * Retorna `null` se o diretório não existir (404).
 */
export async function getDirectoryContent(
  octokit: Octokit,
  params: { owner: string; repo: string; path: string; ref?: string },
): Promise<DirectoryEntry[] | null> {
  try {
    const { data } = await octokit.rest.repos.getContent(params);

    if (!Array.isArray(data)) return null;

    return data.map((entry) => ({
      type: entry.type,
      name: entry.name,
      path: entry.path,
      sha: entry.sha,
    }));
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}

/**
 * Cria ou atualiza um arquivo no repositório (commit de arquivo único).
 * O campo `content` deve ser uma string UTF-8 — a codificação base64 é feita
 * internamente. Passe `sha` para atualizar um arquivo já existente.
 */
export async function upsertFile(
  octokit: Octokit,
  params: {
    owner: string;
    repo: string;
    path: string;
    message: string;
    /** Conteúdo em UTF-8. Será codificado para base64 antes de enviar. */
    content: string;
    sha?: string;
  },
): Promise<void> {
  await octokit.rest.repos.createOrUpdateFileContents({
    owner: params.owner,
    repo: params.repo,
    path: params.path,
    message: params.message,
    content: encodeBase64(params.content),
    sha: params.sha,
  });
}

/**
 * Remove um arquivo do repositório via commit direto.
 * Para remoções em lote (múltiplos arquivos num único commit) use `createTree`
 * de `git.ts` com `sha: null` nos itens a deletar.
 */
export async function deleteFile(
  octokit: Octokit,
  params: {
    owner: string;
    repo: string;
    path: string;
    message: string;
    sha: string;
  },
): Promise<void> {
  await octokit.rest.repos.deleteFile(params);
}

/**
 * Exclui um repositório permanentemente.
 * Requer que o token tenha permissão `delete_repo`.
 */
export async function deleteRepo(
  octokit: Octokit,
  params: { owner: string; repo: string },
): Promise<void> {
  await octokit.rest.repos.delete(params);
}

/**
 * Cria um repositório para o usuário autenticado.
 * `autoInit` cria um commit inicial vazio (necessário para operações git
 * imediatas após a criação).
 */
export async function createRepo(
  octokit: Octokit,
  params: {
    name: string;
    private: boolean;
    autoInit: boolean;
    description?: string;
  },
): Promise<void> {
  await octokit.rest.repos.createForAuthenticatedUser({
    name: params.name,
    private: params.private,
    auto_init: params.autoInit,
    description: params.description,
  });
}

/**
 * Lista os repositórios do usuário autenticado onde ele é owner ou colaborador.
 * O tipo de retorno é `WorkspaceRepo[]` — o mesmo usado em `WorkspaceCard`.
 */
export async function listUserRepos(
  octokit: Octokit,
  params: { perPage?: number } = {},
): Promise<WorkspaceRepo[]> {
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    affiliation: "owner,collaborator",
    sort: "updated",
    per_page: params.perPage ?? 100,
  });
  return data;
}

/**
 * Lista os commits de um arquivo específico no repositório.
 * Útil para construir o histórico de versões de uma nota.
 */
export async function listFileCommits(
  octokit: Octokit,
  params: { owner: string; repo: string; path: string },
): Promise<CommitSummary[]> {
  const { data } = await octokit.rest.repos.listCommits(params);

  return data.map((item) => ({
    sha: item.sha,
    message: item.commit.message,
    date: item.commit.author?.date ?? "",
    authorName: item.commit.author?.name ?? "",
    authorAvatar: item.author?.avatar_url,
  }));
}

/**
 * Lista os colaboradores de um repositório.
 */
export async function listCollaborators(
  octokit: Octokit,
  params: { owner: string; repo: string },
): Promise<CollaboratorEntry[]> {
  const { data } = await octokit.rest.repos.listCollaborators(params);

  return data.map((c) => ({
    id: c.id,
    login: c.login,
    avatarUrl: c.avatar_url,
  }));
}

/**
 * Convida um usuário do GitHub para colaborar num repositório.
 * A permissão padrão é `push` (leitura + escrita).
 */
export async function addCollaborator(
  octokit: Octokit,
  params: {
    owner: string;
    repo: string;
    username: string;
    permission?: "pull" | "push" | "admin" | "maintain" | "triage";
  },
): Promise<void> {
  await octokit.rest.repos.addCollaborator({
    owner: params.owner,
    repo: params.repo,
    username: params.username,
    permission: params.permission ?? "push",
  });
}
