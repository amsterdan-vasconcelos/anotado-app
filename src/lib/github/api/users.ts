import type { Octokit } from "octokit";
import type { User } from "@/types/github";

// ─── Return types ─────────────────────────────────────────────────────────────

/**
 * Informação mínima de uma instalação de GitHub App.
 * Usado para verificar se o usuário já instalou o app na conta pessoal.
 */
export interface UserInstallation {
  id: number;
  account: { login: string } | null;
}

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Retorna o perfil completo do usuário autenticado pela sessão atual.
 * O tipo de retorno é `User` — o mesmo usado em `WorkspaceCard` e derivados.
 */
export async function getAuthenticatedUser(octokit: Octokit): Promise<User> {
  const { data } = await octokit.rest.users.getAuthenticated();
  return data;
}

/**
 * Lista as instalações de GitHub Apps do usuário autenticado.
 * Útil para verificar se o app está instalado na conta pessoal do usuário,
 * o que é necessário para criar repositórios automaticamente.
 *
 * @example
 * const installations = await listUserInstallations(octokit);
 * const hasPersonal = installations.some(
 *   (i) => i.account?.login === user.login
 * );
 */
export async function listUserInstallations(
  octokit: Octokit,
): Promise<UserInstallation[]> {
  const {
    data: { installations },
  } = await octokit.rest.apps.listInstallationsForAuthenticatedUser();

  return installations.map((inst) => ({
    id: inst.id,
    account:
      inst.account && "login" in inst.account
        ? { login: (inst.account as { login: string }).login }
        : null,
  }));
}
