"use server";

import type { ActionResult } from "@/lib/action-result";
import { deleteNoteCommit } from "@/lib/github/note/delete-note";
import { getRequiredSession } from "@/lib/session";

export interface DeleteNoteInput {
  owner: string;
  workspace: string;
  category: string;
  slug: string;
}

export async function deleteNote(
  input: DeleteNoteInput,
): Promise<ActionResult> {
  const session = await getRequiredSession();

  try {
    const { owner, workspace, category, slug } = input;

    await deleteNoteCommit(
      session.accessToken || "",
      owner,
      workspace,
      category,
      slug,
    );

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[deleteNote action]", error);
    return { success: false, error: "Erro ao excluir nota." };
  }
}
