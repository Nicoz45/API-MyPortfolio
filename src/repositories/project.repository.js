import Project from "../Models/Project.model.js";

class projectRepository {
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

    static async getPublicProjects() {
        try {
            const projects = await Project.find({ visibility: "public" }).populate("owner", "name email")
            return projects
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

    static async addStar(project_Id) {
        try {
            const project = await Project.findByIdAndUpdate(
                project_Id,
                { $inc: { stars: 1 } },
                { new: true }
            );
            return project
        } catch (error) {
            throw new Error(`Error adding star: ${error.message}`)
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

export default projectRepository;