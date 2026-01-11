import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'

const adminschema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'moderator'],
        default: 'admin',
    },
}, { timestamps: true })

adminschema.pre("save" , async function(){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password , 10)
    }
})

adminschema.methods.generateAuthToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            role: this.role
        },
        process.env.AUTH_TOKEN_SECRET
        ,{
            expiresIn: process.env.AUTH_TOKEN_EXPIRY
        }
    )
}

adminschema.methods.checkpassword = async function (oldpassword) {
    return bcrypt.compare(oldpassword , this.password)
}

export const Admin = mongoose.model("Admin", adminschema)