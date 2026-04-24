import mongoose from "mongoose";

// Esquema para los archivos de código asociados a los proyectos
const fileSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    path: String,
    content: String,
    language: String
}, {timestamps: true})

const File = mongoose.model("File", fileSchema)

export default File