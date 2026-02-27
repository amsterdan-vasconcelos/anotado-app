import { NextResponse } from "next/server";
import { deleteNoteCommit } from "@/lib/github/note/delete-note";
import { getSessionForApi } from "@/lib/session";

const deleteNote = async (request: Request) => {
  const { session, unauthorized } = await getSessionForApi();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { owner, workspace, category, slug } = body;

    await deleteNoteCommit(
      session.accessToken || "",
      owner,
      workspace,
      category,
      slug,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/notes]", error);
    return NextResponse.json(
      { error: "Erro ao excluir nota" },
      { status: 500 },
    );
  }
};

export { deleteNote };
