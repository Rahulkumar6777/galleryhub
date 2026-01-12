import express from "express"
import { get } from "../controllers/posts/slices/get.controller.js"

const publicRoutes = express.Router()

publicRoutes.get('/post' , get)

export default publicRoutes