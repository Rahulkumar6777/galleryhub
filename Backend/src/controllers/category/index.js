import { createCategory } from "./slices/createCategory.controller.js";
import { getCategory } from "./slices/getCategory.controller.js";

export const Category = {
    Create: createCategory,
    Get: getCategory
}