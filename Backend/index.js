import express from "express"


// here i use dotenv
import { configDotenv } from "dotenv";
configDotenv()


// make app
const app = express();


// export app
export default app