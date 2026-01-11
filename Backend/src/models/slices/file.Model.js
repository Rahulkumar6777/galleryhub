import mongoose from "mongoose";

const fileschema = new mongoose.Schema({
    fileid: {
        type: String,
        required: true,
        unique: true
    },
    filename: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Catogery"
    },
    imgUrl: {
        type: {
            thumb: {
                type: String
            },
            medium: {
                type: String
            },
            large: {
                type: String
            },
            xl: {
                type: String
            }
        },

    }
}, { timestamps: true })

fileschema.index({fileid: 1 , category: true})

export const File = mongoose.model("File" , fileschema)