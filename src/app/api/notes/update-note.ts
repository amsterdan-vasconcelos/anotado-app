import { NextResponse } from "next/server";
import { updateNoteCommit } from "@/lib/github/note/update-note";
import { getSessionForApi } from "@/lib/session";
import { generateSlug } from "@/lib/string-util";

const updateNote = async (request: Request) => {
  const { session, unauthorized } = await getSessionForApi();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const {
      owner,
      workspace,
      oldCategory,
      oldSlug,
      title,
      category,
      content,
      sha,
    } = body;

    const newSlug = generateSlug(title);

    const date = new Date().toISOString();

    await updateNoteCommit(
      session.accessToken || "",
      owner,
      workspace,
      oldCategory,
      oldSlug,
      {
        title,
        category,
        content,
        slug: newSlug,
        date,
        sha,
      },
    );

    return NextResponse.json({ success: true, slug: newSlug });
  } catch (error: any) {
    if (error.message === "CONFLICT" || error.status === 409) {
      return NextResponse.json(
        {
          error: "CONFLICT",
          latestSha: error.latestSha ?? null,
          remoteContent: error.remoteContent ?? null,
        },
        { status: 409 },
      );
    }
    if (error.message === "SLUG_ALREADY_EXISTS") {
      return NextResponse.json(
        { error: "Já existe uma nota com este título no workspace." },
        { status: 400 },
      );
    }
    console.error("[PUT /api/notes]", error);
    return NextResponse.json(
      { error: "Erro ao atualizar a nota" },
      { status: 500 },
    );
  }
};

export { updateNote };
