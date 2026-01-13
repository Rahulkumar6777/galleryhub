import { Delete } from "./slices/delete.controller.js";
import { get } from "./slices/get.controller.js";
import { upload } from "./slices/upload.controller.js";

export const Image= {
    Post : upload,
    Get: get ,
    Delete
}