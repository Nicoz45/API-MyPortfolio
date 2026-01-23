import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "mod", "admin"],
        default: "user",
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    modified_at: {
        type: Date,
        default: Date.now
    },
    active: {
        type: Boolean,
        default: true,
        required: true
    },
    verified_email: {
        type: Boolean,
        default: false,
        required: true
    },
    avatar: {
        type: String,
        required: false
    },
    bio: {
        type: String,
        required: false
    }
}, {timestamps: true})

const User = mongoose.model("User", userSchema)

export default User