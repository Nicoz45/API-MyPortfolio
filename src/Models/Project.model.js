import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true  
    },
    description: String,
    techStack: [String],
    repositoryLink: String,
    liveDemoLink: String,
    visibility: {
        type: String,
        enum: ["public", "private"],
        default: "public"
    },
    stars:{
        type: Number,
        default: 0
    },
    starredBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, {timestamps: true})

const Project = mongoose.model("Project", projectSchema)

export default Project