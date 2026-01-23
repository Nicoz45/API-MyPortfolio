import File from "../Models/File.model.js";

class fileRepository {
    static async createFile(file_data) {
        try {
            const fileCreated = await File.create(file_data)
            return fileCreated
        } catch (error) {
            throw new Error(`Error creating file: ${error.message}`)
        }
    }

    static async getFileById(file_Id) {
        try {
            const file = await File.findById(file_Id).populate("project")
            return file
        } catch (error) {
            throw new Error(`Error getting file: ${error.message}`)
        }
    }

    static async getFilesByProject(project_Id) {
        try {
            const files = await File.find({ project: project_Id }).populate("project")
            return files
        } catch (error) {
            throw new Error(`Error getting files by project: ${error.message}`)
        }
    }

    static async getFileByProjectAndPath(project_Id, path) {
        try {
            const file = await File.findOne({ project: project_Id, path: path }).populate("project")
            return file
        } catch (error) {
            throw new Error(`Error getting file by path: ${error.message}`)
        }
    }

    static async updateFile(file_Id, updateData) {
        try {
            const fileUpdated = await File.findByIdAndUpdate(file_Id, updateData, { new: true })
            return fileUpdated
        } catch (error) {
            throw new Error(`Error updating file: ${error.message}`)
        }
    }

    static async deleteFile(file_Id) {
        try {
            const fileDeleted = await File.findByIdAndDelete(file_Id)
            return fileDeleted;
        } catch (error) {
            throw new Error(`Error deleting file: ${error.message}`)
        }
    }

    static async deleteFilesByProject(project_Id) {
        try {
            const filesDeleted = await File.deleteMany({ project: project_Id })
            return filesDeleted
        } catch (error) {
            throw new Error(`Error deleting files by project: ${error.message}`)
        }
    }

    static async getFilesByLanguage(language) {
        try {
            const files = await File.find({ language: language }).populate("project")
            return files
        } catch (error) {
            throw new Error(`Error getting files by language: ${error.message}`)
        }
    }
}

export default fileRepository