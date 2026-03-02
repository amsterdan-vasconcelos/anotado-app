/**
 * action-result.ts
 *
 * Tipos base para o retorno de todas as server actions.
 * Padrão: { success: true, data } | { success: false, error }
 */

export type ActionOk<T = void> = { success: true; data: T };
export type ActionErr = { success: false; error: string };
export type ActionResult<T = void> = ActionOk<T> | ActionErr;
