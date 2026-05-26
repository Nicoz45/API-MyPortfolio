import Project from "../Models/Project.model.js";

class ProjectRepository {
    static async createProject(project_data) {
        try {
            const projectCreated = await Project.create(project_data)
            return projectCreated
        } catch (error) {
            throw new Error(`Error creating project: ${error.message}`)
        }
    }

    static async getProjectById(projectId) {
        try {
            const project = await Project.findById(projectId).populate("owner", "name email");
            return project;
        } catch (error) {
            throw new Error(`Error getting project: ${error.message}`);
        }
    }

    static async getProjectsByOwner(ownerId) {
        try {
            const projects = await Project.find({ owner: ownerId }).populate("owner", "name email")
            return projects
        } catch (error) {
            throw new Error(`Error getting projects by owner: ${error.message}`)
        }
    }

    static async getPublicProjects(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit
            // 
            // Para paginar correctamente, necesitamos el total de proyectos públicos para calcular el total de páginas
            // Sin embargo, para optimizar la consulta, podemos ejecutar ambas operaciones (contar y obtener) en paralelo usando Promise.all
            // Esto evita hacer dos consultas secuenciales a la base de datos, lo que mejora el rendimiento
            // Primero obtenemos el total de proyectos públicos
            // Luego obtenemos la página actual de proyectos públicos usando skip y limit para paginar correctamente
            // De esta forma, podemos retornar tanto los proyectos como el total en una sola respuesta, lo que facilita la implementación de la paginación en el frontend
            const [projects, total] = await Promise.all([
                Project.find({visibility : "public"})
                .populate("owner", "name email")
                .skip(skip)
                .limit(limit),
                Project.countDocuments({visibility: "public"})
            ])

            return {projects, total, page, limit, totalPages: Math.ceil(total / limit)}
        } catch (error) {
            throw new Error(`Error getting public projects: ${error.message}`)
        }
    }

    static async updateProject(projectId, updateData) {
        try {
            const projectUpdated = await Project.findByIdAndUpdate(projectId, updateData, { new: true })
            return projectUpdated
        } catch (error) {
            throw new Error(`Error updating project: ${error.message}`)
        }
    }

    static async deleteProject(projectId) {
        try {
            const projectDeleted = await Project.findByIdAndDelete(projectId)
            return projectDeleted
        } catch (error) {
            throw new Error(`Error deleting project: ${error.message}`)
        }
    }

    static async addStar(projectId, userId) {
        try {
            const project = await Project.findByIdAndUpdate(
                projectId,
                {
                    $inc: { stars: 1 },
                    $addToSet: { starredBy: userId }
                },
                { new: true }
            );
            return project
        } catch (error) {
            throw new Error(`Error adding star: ${error.message}`)
        }
    }

    static async removeStar(projectId, userId) {
        try {
            const project = await Project.findByIdAndUpdate(
                projectId,
                {
                    $inc: { stars: -1 }, $pull: { starredBy: userId }
                },
                { new: true }
            )
            return project
        } catch (error) {
            throw new Error(`Error removing star: ${error.message}`)
        }
    }

    static async findByTechStack(technology) {
        try {
            const projects = await Project.find({ techStack: technology, visibility: "public" }).populate("owner", "name email")
            return projects
        } catch (error) {
            throw new Error(`Error finding projects by tech: ${error.message}`)
        }
    }
}

export default ProjectRepository