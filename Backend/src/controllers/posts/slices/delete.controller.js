import DevLoad from "devload"
import { Model } from "../../../models/index.js"


export const Delete = async (req, res) => {
    try {
        const fileId = req.params.fileId;

        const devload = new DevLoad(process.env.DEVLOAD_APIKEY);
        const file = await Model.File.findById(fileId);
        if (!file) {
            return res.status(404).json({
                message: "Invalid or File Not Found"
            })
        }

        const deleteId = file.deleteId.toObject();

        const { _id, ...files } = deleteId;

        for (const filename of Object.values(files)) {
            await devload.deleteFile(filename);
        }

        await Model.File.deleteOne({ _id: fileId })

        return res.status(200).json({
            message: "File Deleted Success"
        })
    } catch (error) {
        console.log(error?.message)
        return res.status(500).json({
            error: "Internal server Error"
        })
    }
}