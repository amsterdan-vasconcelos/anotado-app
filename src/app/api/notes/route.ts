import { createNote } from "./create-note";
import { deleteNote } from "./delete-note";
import { updateNote } from "./update-note";

export const POST = createNote;
export const PUT = updateNote;
export const DELETE = deleteNote;
