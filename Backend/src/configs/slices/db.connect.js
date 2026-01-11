import mongoose from "mongoose";

export const dbConnect = async () => {
    try {
        await mongoose.connect(`${process.env.NODE_ENV === "production" ? process.env.PRODUCTION_DB_URI : process.env.LOCALHOST_URI}`, {
            authSource: "admin"
        })
        console.log("database connected")
    } catch (error) {
        console.log("Error while connect DB" , error)
      process.exit(1)  
    }
}