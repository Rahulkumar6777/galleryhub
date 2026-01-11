import express from "express"
import { Config } from "./src/configs/index.js";

// here i use dotenv
import { configDotenv } from "dotenv";
configDotenv()


// connect db
await Config.DataBase()


// make app
const app = express();


// export app
export default app