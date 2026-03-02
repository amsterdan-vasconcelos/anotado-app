"use server";

import type { ActionErr, ActionOk } from "@/lib/action-result";
import { updateNoteCommit } from "@/lib/github/note/update-note";
import { getRequiredSession } from "@/lib/session";
import { generateSlug } from "@/lib/string-util";

export type UpdateNoteResult =
  | ActionOk<{ slug: string }>
  | { success: false; conflict: true; remoteContent: string; latestSha: string }
  | ActionErr;

export interface UpdateNoteInput {
  owner: string;
  workspace: string;
  oldCategory: string;
  oldSlug: string;
  title: string;
  category: string;
  content: string;
  sha: string;
}

export async function updateNote(
  input: UpdateNoteInput,
): Promise<UpdateNoteResult> {
  const session = await getRequiredSession();

  try {
    const {
      owner,
      workspace,
      oldCategory,
      oldSlug,
      title,
      category,
      content,
      sha,
    } = input;

    const newSlug = generateSlug(title);
    const date = new Date().toISOString();

    await updateNoteCommit(
      session.accessToken ?? "",
      owner,
      workspace,
      oldCategory,
      oldSlug,
      { title, category, content, slug: newSlug, date, sha },
    );

    return { success: true, data: { slug: newSlug } };
  } catch (error: any) {
    if (error.message === "CONFLICT" || error.status === 409) {
      return {
        success: false,
        conflict: true,
        remoteContent: error.remoteContent ?? "",
        latestSha: error.latestSha ?? "",
      };
    }

    if (error.message === "SLUG_ALREADY_EXISTS") {
      return {
        success: false,
        error: "Já existe uma nota com este título no workspace.",
      };
    }

    console.error("[updateNote action]", error);
    return { success: false, error: "Erro ao atualizar nota." };
  }
}
