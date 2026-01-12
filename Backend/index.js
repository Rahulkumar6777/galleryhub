import express from "express"
import { Config } from "./src/configs/index.js";
import cookieParser from "cookie-parser";

// here i use dotenv
import { configDotenv } from "dotenv";
configDotenv()


// connect db
await Config.DataBase()


// make app
const app = express();


app.use(express.json())
app.use(express.urlencoded({extended: true}))


app.use(cookieParser())


// export app
export default app