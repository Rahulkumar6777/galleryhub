import express from "express"
import { Image } from "../controllers/posts/index.js";
import { upload } from "../middlewares/multer.middleware.js";
import { Auth } from "../controllers/Auth/index.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const adminRoutes = express.Router()

adminRoutes.post('/upload',

    verifyJwt,
    (req, res, next) => {
        upload.single("file")(req, res, function (err) {
            if (err) {
                console.error("Upload error:", err);
                return res.status(err.statusCode || 400).json({
                    message: err.message || "Upload failed",
                });
            }
            next();
        });
    },
    Image.Post)

adminRoutes.post('/login' , Auth.Login)


export default adminRoutes;