import { Model } from "../../../models/index.js";

export const register = async (req, res) => {
    try {
        const code = req.headers.x - code;
        const { password , username} = req.body

        if(!username || !password){
            return res.status(400).json({
                message: "Username and password required"
            })
        }

        if (code !== process.env.REGISTER_CODE) {
            return res.status(400).json({
                message: "Invalid Code"
            })
        }

        await Model.Admin.create({
            username,
            password
        })

        return res.status(200).json({
            message: "Success"
        })

    } catch (error) {
        return res.status(500).json({
            error: "internal server Error"
        })
    }
}