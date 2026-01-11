import { Model } from "../../../models/index.js"


export const createCategory = async (req, res) => {
    try {
        const { name } = req.body

        if (!name) {
            return res.status(400).json({
                message: "name required"
            })
        }

        await Model.Category.create({
            name: name
        })

        return res.status(200).json({
            message: "Category Created successfully"
        })
    } catch (error) {
        return res.status(500).json({
            error: "Internal server Error"
        })
    }
}