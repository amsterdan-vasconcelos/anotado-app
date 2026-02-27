import * as createNote from "./create-note";
import * as deleteNote from "./delete-note";
import * as updateNote from "./update-note";

export const note = { ...createNote, ...deleteNote, ...updateNote };
