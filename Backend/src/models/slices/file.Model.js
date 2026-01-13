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


fileschema.index({ createdAt: -1 });
fileschema.index({ impression: -1 });
fileschema.index({ category: 1, createdAt: -1 });


export const File = mongoose.model("File", fileschema)