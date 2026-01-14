import axios from "axios";
import FormData from 'form-data';
import fs from 'fs';
import { Model } from "../../../models/index.js";



export const upload = async (req, res) => {
    try {
        const { categoryId, filename } = req.body;


        const file = req.file;

        if (!file) {
            return res.status(400).json({
                message: "file is required"
            })
        }

        if (!categoryId || !filename) {
            fs.unlinkSync(file.path)
            return res.status(400).json({
                message: "category and filename is required"
            })
        }

        const cate = Model.Category.findById(categoryId)

        if (!cate) {
            return res.status(400).json({
                message: "Invalid Category"
            })
        }

        if (cate.name === "Popular" || cate.name === "Recent") {
            return res.status(403).json({
                message: "You dont have access to upload in this category"
            })
        }

        const formData = new FormData();
        formData.append('file', fs.createReadStream(file.path));

        const response = await axios.post(
            `https://api-devload.cloudcoderhub.in/api/v1/private/${process.env.P_ID}`,

            formData
            ,
            {
                headers: {
                    ...formData.getHeaders(),
                    'x-api-key': process.env.DEVLOAD_APIKEY,
                    'x-private-key': process.env.DEVLOAD_PRIVATE_KEY,
                },
            }
        );

        console.log(response)
        const urls = response.data.urls

        const urlsMap = {};
        const deleteId = {}

        for (const url of urls) {
            urlsMap[url.size] = url.publicUrl;
            deleteId[url.size] = url.filename
        }


        const resp = await Model.File.create({
            filename,
            category: categoryId,
            imgUrl: {
                thumb: urlsMap.thumb,
                medium: urlsMap.medium,
                large: urlsMap.large,
                xl: urlsMap.xl
            },
            deleteId: {
                thumb: deleteId.thumb,
                medium: deleteId.medium,
                large: deleteId.large,
                xl: deleteId.xl
            }

        })
        fs.unlinkSync(file.path)

        return res.status(200).json({
            message: "success",
            file: resp
        })
    } catch (error) {
        fs.unlinkSync(req?.file?.path)
        console.log(error)
        return res.status(500).json({
            error: "Internal server Error"
        })
    }
}