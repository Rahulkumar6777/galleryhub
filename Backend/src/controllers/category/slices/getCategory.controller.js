import { Model } from "../../../models/index.js"

export const getCategory = async (req, res) => {
    try {

        const categories = await Model.Category.find();

        return res.status(200).json({
            message: "Success",
            categories
        })

    } catch (error) {
        return res.status(500).json({
            error: "Internal server Error"
        })
    }
}