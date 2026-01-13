import mongoose from "mongoose";

const fileschema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    impression: {
        type: Number,
        default: 0
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