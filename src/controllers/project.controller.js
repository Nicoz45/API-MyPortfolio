import { ServerError } from "../services/Error.service.js"
import ProjectService from "../services/project.service.js"

class ProjectController {
    static async createProject (req, res) {
        try {
            const {owner, title, description, techStack, repositoryLink, liveDemoLink, visibility} = req.body
            const projectCreated = await ProjectService.createProject({
                owner,
                title,
                description,
                techStack,
                repositoryLink,
                liveDemoLink,
                visibility
            })
            console.log("Project created sucessfully", projectCreated._id)
            return res.status(201).json({
                ok: true,
                message: "Project created sucessfully",
                project: projectCreated,
                status: 201
            })
        } catch (error) {
            console.error("Created project error", error.message)
            console.error("Stack: ", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500
            return res.status(statusCode).json({
                ok: false,
                message: error.message || "Error creating project",
                status: statusCode
            })
        }
    }

    static async getById (req, res){
        try {
            const {project} = req
            const projectSelected = await ProjectService.getProjectById(project._id)
            return res.status(201).json({
                ok: true,
                message: "Proyect found Succesfully",
                project: projectSelected,
                status: 201
            })
        } catch (error) {
            console.error("Error getting the project ", error.message)
            console.error("Stack ", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500
            return res.status(statusCode).json({
                ok: false,
                message: error.message,
                status: statusCode
            })
        }
    }

    static async getByOwner(req, res){
        try {
            // el owner viene por params, no por query ni body
            const {owner} = req.params;
            // corroboramos que el owner exista y sea un ID válido
            if (!owner) {
                throw new ServerError(400, "Owner parameter is required")
            }
            // obtenemos los proyectos del owner solicitado
            const ownerProjects = await ProjectService.getProjectsByOwner(owner);
            return res.status(200).json({
                ok: true,
                message: "Projects retrieved successfully",
                projects: ownerProjects,
                status: 200
            })
        } catch (error) {
            console.error("Error getting projects by owner ", error.message);
            console.error("Stack ", error.stack);
        }
    }

    static async addStar(req, res){
        try {
            const {project} = req
            const projectStarred = await ProjectService.addStar(project)
            return res.status(200).json({
                ok: true,
                message: "Project starred successfully",
                project: projectStarred,
                status: 200
            })
        } catch (error) {
            console.error("Error starring the project ", error.message)
            console.error("Stack ", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500
            return res.status(statusCode).json({
                ok: false,
                message: error.message,
                status: statusCode
            })
        }
    }

    static async updateProject (req, res) {
        try {
            const {project} = req;
            const update_data = req.body;
            const projectUpdated = await ProjectService.updateProject(project._id, update_data)
            return res.status(200).json({
                ok: true,
                message: "Project updated successfully",
                project: projectUpdated,
                status: 200
            })
        } catch (error) {
            console.error("Error updating the project ", error.message);
            console.error("Stack ", error.stack);
            const statusCode = error instanceof ServerError ? error.status : 500;
            return res.status(statusCode).json({
                ok: false,
                message: error.message,
            })
        }
    }
    
    static async deleteProject (req, res){
        try {
            const {project} = req;
            const projectDeleted = await ProjectService.deleteProject(project._id);
            return res.status(200).json({
                ok: true,
                message: "Project deleted successfully",
                project: projectDeleted,
                status: 200,
            })
        } catch (error) {
            console.error("Error deleting the project ", error.message);
            console.error("Stack ", error.stack);
            const statusCode = error instanceof ServerError ? error.status : 500;
            return res.status(statusCode).jsom({
                ok: false,
                message: error.message,
                status: statusCode
            })
        }
    }

}


export default ProjectController