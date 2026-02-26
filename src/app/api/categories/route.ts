import { createCategory } from "./create-category";
import { deleteCategory } from "./delete-category";
import { findCategories } from "./find-categories";
import { updateCategory } from "./update-category";

const POST = async (request: Request) => createCategory(request);

const GET = (request: Request) => findCategories(request);

const PUT = (request: Request) => updateCategory(request);

const DELETE = (request: Request) => deleteCategory(request);

export { POST, GET, PUT, DELETE };
