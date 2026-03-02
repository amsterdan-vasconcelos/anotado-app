import { redirect } from "next/navigation";
import type { CustomSession } from "@/types/auth";
import { auth } from "./auth";

/**
 * Para uso em Server Components, Pages e Server Actions.
 * Garante que o usuário está autenticado e retorna a sessão tipada.
 * Redireciona para /signin caso não haja sessão válida.
 */
export async function getRequiredSession(): Promise<CustomSession> {
  const session = (await auth()) as CustomSession | null;

  if (!session?.accessToken) {
    redirect("/signin");
  }

  return session;
}
