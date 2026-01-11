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
        type: String,
        enum: [
            "Abstract", "Portrait", "Landscape", "Street Photography", "Nature", "Wildlife", "Architecture", "Travel", "Fashion", "Food", "Sports", "Music", "Dance", "Digital Art", "Illustration", "Painting", "Sculpture", "Black & White", "Minimalism", "Macro", "Aerial", "Night Photography", "Documentary", "Conceptual", "Fantasy", "Surrealism", "Pop Art", "Cultural", "Historical", "Editorial", "Commercial", "Product", "Event", "Wedding", "Film & Cinematic", "Experimental"
        ]
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