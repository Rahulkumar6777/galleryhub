import jwt from "jsonwebtoken"
import { Model } from "../models/index.js";

export const verifyJwt = async (req, res, next) => {
    try {
        const Token = req?.cookies?.Token;

        if (!Token) {
            return res.status(403).json({
                message: "Token Not Found"
            })
        }

        const decoded = jwt.verify(Token, process.env.AUTH_TOKEN_SECRET);
        console.log(decoded)

        const admin = await Model.Admin.findById(decoded._id)
        if (!admin) {
            return res.status(403).json({
                message: "Invalid Admin"
            })
        }

        req.admin = admin

        next()

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: "Internal server Error"
        })
    }
}