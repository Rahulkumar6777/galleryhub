import { createCategory } from "./slices/createCategory.controller";
import { getCategory } from "./slices/getCategory.controller";

export const Category = {
    Create: createCategory,
    Get: getCategory
}