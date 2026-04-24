import mongoose from "mongoose";
import { ROLE_LIMITS, ROLES } from "../constants/roles.constants.js";

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
        enum: Object.values(ROLES),
        default: ROLES.USER,
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
    },
    website: String,
    github: String,
    linkedin: String,
    
    preferences: {
        emailNotifications: {type: Boolean, default: true},
        profileVisibility: {type: String, enum: ["public", "private"], default: "public"},
    }

}, {timestamps: true})

//Metodo para verificar limites segun rol
// Agrega métodos de instancia al esquema para verificar los límites de proyectos y archivos según el rol del usuario
userSchema.methods.canCreateProject = async function(){
    const roleLimits = ROLE_LIMITS[this.role]
    const projectCount = await mongoose.model("Project").countDocuments({ owner: this._id })
    return projectCount < roleLimits.maxProjects
}

userSchema.methods.canCreatePrivateProject = async function(){
    const roleLimits = ROLE_LIMITS[this.role]
    const privateProjectsCount = await mongoose.model("Project").countDocuments({owner: this._id, visibility: "private"})
    return privateProjectsCount < roleLimits.maxPrivateProjects
}

// Este metodo devuelve los limites del rol del usuario, para que puedan ser usados en el frontend y mostrar mensajes claros al usuario sobre sus limites
userSchema.methods.getRoleLimits = async function() {
    return ROLE_LIMITS[this.role]
}

const User = mongoose.model("User", userSchema)

export default User