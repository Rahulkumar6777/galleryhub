import { Model } from "../../../models/index.js"
import DevLoad from "devload";


export const deleteCategory = async (req, res) => {
    try {
        const categoryid = req.params.categoryId;
        const devload = new DevLoad(process.env.DEVLOAD_APIKEY);

        const cate = await Model.Category.findById(categoryid)

        if (!cate) {
            return res.status(400).json({
                message: "Invalid Category"
            })
        }

        if (cate.name === "Popular" || cate.name === "Recent") {
            return res.status(403).json({
                message: "You dont have access to delete this category"
            })
        }

        const files = await Model.File.find({ category: categoryid })
        if (files.length > 0) {
            for (const file of files) {
                const deleteId = file.deleteId.toObject();

                const { _id, ...files } = deleteId;

                for (const filename of Object.values(files)) {
                    await devload.deleteFile(filename);
                }
            }

            await Model.File.deleteMany({ category: categoryid })
        } else {

            await Model.Category.deleteOne({ _id: categoryid })
            return res.status(200).json({
                message: 'All file Deleted'
            })
        }


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: "Internal server Error"
        })
    }
}