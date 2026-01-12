import express from "express"
import { Image } from "../controllers/posts/index.js"
import { Category } from "../controllers/category/index.js"

const publicRoutes = express.Router()

publicRoutes.get('/post' , Image.Get)
publicRoutes.get('/category' , Category.Get)

export default publicRoutes