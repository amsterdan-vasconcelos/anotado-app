"use server";

import type { ActionResult } from "@/lib/action-result";
import { createNoteCommit } from "@/lib/github/note/create-note";
import { getRequiredSession } from "@/lib/session";
import { generateSlug } from "@/lib/string-util";

export interface CreateNoteInput {
  owner: string;
  workspace: string;
  title: string;
  category: string;
  content: string;
}

export async function createNote(
  input: CreateNoteInput,
): Promise<ActionResult<{ slug: string }>> {
  const session = await getRequiredSession();

  try {
    const { owner, workspace, title, category, content } = input;
    const slug = generateSlug(title);
    const date = new Date().toISOString();

    await createNoteCommit(session.accessToken ?? "", owner, workspace, {
      title,
      category,
      content,
      slug,
      date,
    });

    return { success: true, data: { slug } };
  } catch (error: any) {
    if (error.message === "SLUG_ALREADY_EXISTS") {
      return {
        success: false,
        error: "Já existe uma nota com este título no workspace.",
      };
    }
    console.error("[createNote]", error);
    return { success: false, error: "Erro ao salvar nota." };
  }
}
