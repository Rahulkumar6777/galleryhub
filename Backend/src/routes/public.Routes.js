import express from "express"
import { Image } from "../controllers/posts/index.js"

const publicRoutes = express.Router()

publicRoutes.get('/post' , Image.Get)

export default publicRoutes