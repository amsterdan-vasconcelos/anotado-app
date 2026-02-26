/**
 * api-client.ts
 *
 * Funções utilitárias centralizadas para todas as chamadas fetch feitas
 * pelo lado do cliente (componentes "use client").
 *
 * Padrão de retorno: { success: true, data } | { success: false, error }
 * Toda lógica de try/catch fica aqui — os componentes só lidam com o resultado.
 */

// ---------------------------------------------------------------------------
// Tipos base
// ---------------------------------------------------------------------------

export type ApiOk<T = void> = { success: true; data: T };
export type ApiErr = { success: false; error: string };
export type ApiResult<T = void> = ApiOk<T> | ApiErr;

/** Resultado especial para edição com conflito de versão. */
export type UpdateNoteResult =
  | ApiOk<{ slug: string }>
  | { success: false; conflict: true; remoteContent: string; latestSha: string }
  | ApiErr;

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

async function handleResponse<T>(res: Response): Promise<ApiResult<T>> {
  if (res.ok) {
    const data = res.status === 204 ? undefined : await res.json();
    return { success: true, data: data as T };
  }

  let error = `Erro inesperado (${res.status})`;
  try {
    const body = await res.json();
    if (body?.error) error = body.error;
  } catch {
    // ignora erro de parse
  }

  return { success: false, error };
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export interface CreateNotePayload {
  owner: string;
  workspace: string;
  title: string;
  category: string;
  content: string;
}

export async function apiCreateNote(
  payload: CreateNotePayload,
): Promise<ApiResult<{ slug: string }>> {
  try {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ slug: string }>(res);
  } catch {
    return { success: false, error: "Erro de conexão ao salvar a nota." };
  }
}

export interface UpdateNotePayload {
  owner: string;
  workspace: string;
  oldCategory: string;
  oldSlug: string;
  title: string;
  category: string;
  content: string;
  sha: string;
}

export async function apiUpdateNote(
  payload: UpdateNotePayload,
): Promise<UpdateNoteResult> {
  try {
    const res = await fetch("/api/notes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 409) {
      const body = await res.json();
      return {
        success: false,
        conflict: true,
        remoteContent: body.remoteContent ?? "",
        latestSha: body.latestSha ?? "",
      };
    }

    return handleResponse<{ slug: string }>(res);
  } catch {
    return { success: false, error: "Erro de conexão ao atualizar a nota." };
  }
}

export interface DeleteNotePayload {
  owner: string;
  workspace: string;
  category: string;
  slug: string;
}

export async function apiDeleteNote(
  payload: DeleteNotePayload,
): Promise<ApiResult> {
  try {
    const res = await fetch("/api/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  } catch {
    return { success: false, error: "Erro de conexão ao excluir a nota." };
  }
}

// ---------------------------------------------------------------------------
// Workspaces
// ---------------------------------------------------------------------------

export async function apiCreateWorkspace(
  name: string,
): Promise<ApiResult<{ owner: string; slug: string }>> {
  try {
    const res = await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    return handleResponse<{ owner: string; slug: string }>(res);
  } catch {
    return { success: false, error: "Erro de conexão ao criar o workspace." };
  }
}

export async function apiDeleteWorkspace(
  owner: string,
  workspace: string,
): Promise<ApiResult> {
  try {
    const res = await fetch("/api/workspaces", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner, workspace }),
    });
    return handleResponse(res);
  } catch {
    return { success: false, error: "Erro de conexão ao excluir o workspace." };
  }
}

// ---------------------------------------------------------------------------
// Collaborators
// ---------------------------------------------------------------------------

export interface Collaborator {
  id: number;
  login: string;
  avatar_url: string;
}

export async function apiFetchCollaborators(
  owner: string,
  workspace: string,
): Promise<ApiResult<Collaborator[]>> {
  try {
    const res = await fetch(
      `/api/collaborators?owner=${owner}&workspace=${workspace}`,
    );
    return handleResponse<Collaborator[]>(res);
  } catch {
    return {
      success: false,
      error: "Erro de conexão ao buscar colaboradores.",
    };
  }
}

export async function apiInviteCollaborator(
  owner: string,
  workspace: string,
  username: string,
): Promise<ApiResult> {
  try {
    const res = await fetch("/api/collaborators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner, workspace, username }),
    });
    return handleResponse(res);
  } catch {
    return { success: false, error: "Erro de conexão ao enviar o convite." };
  }
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function apiFetchCategories(
  owner: string,
  workspace: string,
): Promise<ApiResult<string[]>> {
  try {
    const res = await fetch(
      `/api/categories?owner=${owner}&workspace=${workspace}`,
    );
    if (!res.ok) return { success: false, error: "Erro ao buscar categorias." };
    const body = await res.json();
    return { success: true, data: body.categories as string[] };
  } catch {
    return {
      success: false,
      error: "Erro de conexão ao buscar categorias.",
    };
  }
}

export interface RenameCategoryPayload {
  owner: string;
  workspace: string;
  oldCategory: string;
  newCategory: string;
}

export async function apiRenameCategory(
  payload: RenameCategoryPayload,
): Promise<ApiResult> {
  try {
    const res = await fetch("/api/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  } catch {
    return {
      success: false,
      error: "Erro de conexão ao renomear a categoria.",
    };
  }
}

export async function apiAddCategory(
  owner: string,
  workspace: string,
  category: string,
): Promise<ApiResult> {
  try {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner, workspace, category }),
    });
    return handleResponse(res);
  } catch {
    return { success: false, error: "Erro de conexão ao criar a categoria." };
  }
}

export async function apiDeleteCategory(
  owner: string,
  workspace: string,
  category: string,
): Promise<ApiResult> {
  try {
    const res = await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner, workspace, category }),
    });
    return handleResponse(res);
  } catch {
    return { success: false, error: "Erro de conexão ao excluir a categoria." };
  }
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

export interface CommitRecord {
  sha: string;
  message: string;
  date: string;
  authorName: string;
  authorAvatar?: string;
}

export async function apiFetchHistory(
  owner: string,
  workspace: string,
  path: string,
): Promise<ApiResult<CommitRecord[]>> {
  try {
    const res = await fetch(
      `/api/history?owner=${owner}&workspace=${workspace}&path=${path}`,
    );
    return handleResponse<CommitRecord[]>(res);
  } catch {
    return {
      success: false,
      error: "Erro de conexão ao buscar histórico.",
    };
  }
}

// ---------------------------------------------------------------------------
// Version
// ---------------------------------------------------------------------------

export async function apiFetchVersion(
  owner: string,
  workspace: string,
  path: string,
  ref: string,
): Promise<ApiResult<{ content: string }>> {
  try {
    const res = await fetch(
      `/api/version?owner=${owner}&workspace=${workspace}&path=${encodeURIComponent(path)}&ref=${ref}`,
    );
    return handleResponse<{ content: string }>(res);
  } catch {
    return {
      success: false,
      error: "Erro de conexão ao buscar versão.",
    };
  }
}
