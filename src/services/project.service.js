import mongoose from "mongoose";
import UserRepository from "../repositories/user.repository.js";
import { ServerError } from "./Error.service.js";
import ProjectRepository from "../repositories/project.repository.js";

class ProjectService {
    /* --------- helpers --------- */
    // convierte un identificador flexible de propietario a un ObjectId válido
    static async _getOwnerId(owner) {
        if (!owner) {
            throw new ServerError(400, "Owner identifier is required");
        }

        // ya es un ObjectId válido
        if (mongoose.Types.ObjectId.isValid(owner)) {
            return owner;
        }

        // puede ser un objeto con _id
        if (typeof owner === 'object' && owner._id && mongoose.Types.ObjectId.isValid(owner._id)) {
            return owner._id;
        }

        // string: buscar por username o email
        if (typeof owner === 'string') {
            let ownerDoc = await UserRepository.getByUsername(owner);
            if (!ownerDoc) ownerDoc = await UserRepository.getByEmail(owner);
            if (ownerDoc) return ownerDoc._id;
        }

        // si llegamos aquí no se pudo resolver
        throw new ServerError(404, "Owner not found");
    }

    // asegura que techStack sea un array limpio
    static _normalizeTechStack(data) {
        if (!data || data.techStack == null) return;
        if (!Array.isArray(data.techStack)) {
            if (typeof data.techStack === 'string') {
                data.techStack = data.techStack
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean);
            } else {
                data.techStack = [data.techStack];
            }
        }
    }

    /* --------- public service methods --------- */
    static async createProject(project_data) {
        try {
            // Desestructuramos el owner y el title de project_data
            const { owner, title } = project_data || {}

            // Corroboramos que el owner y el title existan
            if (!owner || !title) {
                throw new ServerError(400, "Owner and title are required");
            }

            project_data.owner = await this._getOwnerId(owner);
            this._normalizeTechStack(project_data);

            const projectCreated = await ProjectRepository.createProject(project_data);
            return projectCreated;
        } catch (error) {
            if (error instanceof ServerError) {
                throw error
            }
            console.error("Unexpected error in ProjectService ", error.message)
            throw new ServerError(500, error.message || "Error creating project")
        }
    }

    static async getProjectById(project_id) {
        try {
            if(!mongoose.Types.ObjectId.isValid(project_id)){
                throw new ServerError(400, "Invalid project ID")
            }
            const project = await ProjectRepository.getProjectById(project_id)
            if (!project) {
                throw new ServerError(404, "Project not found")
            }
            return project

        } catch (error) {
            if (error instanceof ServerError) {
                throw error
            }
            console.error("Unexpected error in ProjectService ", error.message)
            throw new ServerError(500, error.message || "Error getting project")
        }
    }

    // retorna un array (posiblemente vacío) en lugar de lanzar 404
    static async getProjectsByOwner(owner) {
        try {
            const ownerId = await this._getOwnerId(owner);
            const projects = await ProjectRepository.getProjectsByOwner(ownerId);
            // no se arroja 404; el controlador decide qué hacer si es vacío
            return projects || [];
        } catch (error) {
            if (error instanceof ServerError) {
                throw error
            }
            console.error("Unexpected error in ProjectService ", error.message)
            throw new ServerError(500, error.message || "Error getting projects by owner")
        }
    }

    static async getPublicProjects() {
        try {
            const projects = await ProjectRepository.getPublicProjects();
            return projects || [];
        } catch (error) {
            if(error instanceof ServerError){
                throw error
            }
            console.error("Unexpected error in ProjectService ", error.message)
            throw new ServerError(500, error.message || "Error getting public projects")
        }
    }

    static async getProjectsByTech(technology) {
        try {
            if(!technology || typeof technology !== 'string'){
                throw new ServerError(400, "Technology must be a non-empty string")
            }
            const projects = await ProjectRepository.findByTechStack(technology)
            return projects ?? []
        } catch (error) {
            if(error instanceof ServerError){
                throw error
            }
            console.error("Unexpected error in ProjectService ", error.message)
            throw new ServerError(500, error.message || "Error getting projects by technology")
        }
    }
    
    static async updateProject(project_id, update_data){
        try {
            if(!mongoose.Types.ObjectId.isValid(project_id)){
                throw new ServerError(400, "Invalid project Id")
            }
            if(update_data.owner !== undefined){
                update_data.owner = await this._getOwnerId(update_data.owner)
            }
            const projectUpdated = await ProjectRepository.updateProject(project_id, update_data)
            return projectUpdated
        } catch (error) {
            if(error instanceof ServerError){
                throw error
            }
            console.error("Unexpected error in ProjectService ", error.message)
            throw new ServerError(500, error.message || "Error updating project")
        }
    }

    static async deleteProject(project_id){
        try {
            if(!mongoose.Types.ObjectId.isValid(project_id)){
                throw new ServerError(400, "Invalid project Id")
            }
            const projectToDelete = await ProjectRepository.getProjectById(project_id)
            if(!projectToDelete){
                throw new ServerError(404, "Project not found")
            }
            await ProjectRepository.deleteProject(project_id)
            return projectToDelete
        } catch (error) {
            if(error instanceof ServerError){
                throw error
            }
            console.error("Unexpected error in ProjectService ", error.message)
            throw new ServerError(500, error.message || "Error to delete project")
        }
    }

    static async addStar(project_id){
        try {
            if(!mongoose.Types.ObjectId.isValid(project_id)){
                throw new ServerError(400, "Invalid project Id")
            }

            const addStarToProject = await ProjectRepository.addStar(project_id)
            return addStarToProject
        } catch (error) {
            if(error instanceof ServerError){
                throw error
            }
            console.error("Unexpected error in ProjectService", error.message)
            throw new ServerError(500, error.message || "Error adding a star to the project")
        }
    }
}

export default ProjectService