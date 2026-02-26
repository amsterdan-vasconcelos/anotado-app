import { createCategory } from "./create-category";
import { deleteCategory } from "./delete-category";
import { findCategories } from "./find-categories";
import { updateCategory } from "./update-category";

export const POST = createCategory;
export const GET = findCategories;
export const PUT = updateCategory;
export const DELETE = deleteCategory;
