import mongoose from "mongoose";

const fileschema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    filename: {
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    deleteId: {
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
        }
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

fileschema.index({ category: 1 });

export const File = mongoose.model("File", fileschema)