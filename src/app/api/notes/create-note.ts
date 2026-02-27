import { NextResponse } from "next/server";
import { createNoteCommit } from "@/lib/github/note/create-note";
import { getSessionForApi } from "@/lib/session";

const createNote = async (request: Request) => {
  const { session, unauthorized } = await getSessionForApi();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    console.log("Received data for new note:", body);
    const { owner, workspace, title, category, content } = body;

    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const date = new Date().toISOString();

    await createNoteCommit(session.accessToken || "", owner, workspace, {
      title,
      category,
      content,
      slug,
      date,
    });

    return NextResponse.json({ success: true, slug });
  } catch (error: any) {
    if (error.message === "SLUG_ALREADY_EXISTS") {
      return NextResponse.json(
        { error: "Já existe uma nota com este título no workspace." },
        { status: 400 },
      );
    }
    console.error("[POST /api/notes]", error);
    return NextResponse.json({ error: "Erro ao salvar nota" }, { status: 500 });
  }
};

export { createNote };
