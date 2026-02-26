import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { CustomSession } from "@/types/auth";
import { auth } from "./auth";

/**
 * Para uso em Server Components e Page routes.
 * Garante que o usuário está autenticado e retorna a sessão tipada.
 * Redireciona para /login caso não haja sessão válida.
 */
export async function getRequiredSession(): Promise<CustomSession> {
  const session = (await auth()) as CustomSession | null;

  if (!session?.accessToken) {
    redirect("/signin");
  }

  return session;
}

/**
 * Para uso em API Routes (route handlers).
 * Retorna a sessão tipada ou uma NextResponse 401 pronta para ser retornada.
 */
export async function getSessionForApi(): Promise<
  | { session: CustomSession; unauthorized: null }
  | { session: null; unauthorized: NextResponse }
> {
  const session = (await auth()) as CustomSession | null;

  if (!session?.accessToken) {
    return {
      session: null,
      unauthorized: NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 },
      ),
    };
  }

  return { session, unauthorized: null };
}
