import mongoose from "mongoose"
import { ServerError } from "./Error.service.js"
import FileRepository from "../repositories/file.repository.js"
import ProjectRepository from "../repositories/project.repository.js"
import { ROLE_LIMITS, ROLES } from "../constants/roles.constants.js"


class FileService {
    static async createFile(file_data, user){
        try {
            const {project, path, content, language} = file_data

            // Comprobamos que exitan tanto el project y el path
            if(!project || !path){
                throw new ServerError(400, "Project and path any required")
            }
            // Comprobamos que el project sea un objeto valido
            if(!mongoose.Types.ObjectId.isValid(project)){
                throw new ServerError(400, "Invalid project ID")
            }
            // Pasamos a obtener el proyecto
            const projectFound = await ProjectRepository.getProjectById(project)
            if(!projectFound){
                throw new ServerError(404, "Project not found")
            }

            // Verificar que el usuario sea dueño del proyecto
            if(projectFound.owner._id.toString() !== user._id.toString()){
                throw new ServerError(403, "You can only add files to your own projects")
            }
            // Verificar límite de archivos según rol
            const limitOfProjects = ROLE_LIMITS[user.role]
            const existingFiles = await FileRepository.getFilesByProject(project)
            if(existingFiles.length >= limitOfProjects.maxFilesPerProject){
                throw new ServerError(403, `You have reached the file limit for this project (${limits.maxFilesPerProject})`)
            }
            // Verificar que no exista ya un archivo con el mismo path en el proyecto
            const existingFilePath = await FileRepository.getFileByProjectAndPath(project, path)
            if(existingFilePath){
                throw new ServerError(409,"A file with this path already exists in the project")
            }
            // Ahora si pasamos a crear el achivo
            const fileCreated = await FileRepository.createFile({project, path, content, language})
            return fileCreated

        } catch (error) {
            if (error instanceof ServerError) {
                throw error
            }
            console.error("Unexpected error in FileService ", error.message)
            throw new ServerError(500, error.message || "Error creating File")
        }
    }

    static async getFileById(file_Id){
        try {
            if(!mongoose.Types.ObjectId.isValid(file_Id)){
                throw new ServerError(400, "Invalid File ID")
            }
            const file = await FileRepository.getFileById(file_Id)
            if(!file) {throw new ServerError(404, "File not found")}
            return file || []
        } catch (error) {
            if (error instanceof ServerError) {
                throw error
            }
            console.error("Unexpected error in FileService ", error.message)
            throw new ServerError(500, error.message || "Error getting File")
        }
    }

    static async getFileByProject(project_id){
        try {
            if(!mongoose.Types.ObjectId.isValid(project_id)){
                throw new ServerError(400, "Invalid project ID")
            }
            const fileByProject = await FileRepository.getFilesByProject(project_id)
            if(!fileByProject){
                throw new ServerError(404, "File not found")
            }
            return fileByProject || []
        } catch (error) {
            if (error instanceof ServerError) {
                throw error
            }
            console.error("Unexpected error in FileService ", error.message)
            throw new ServerError(500, error.message || "Error getting File by project")
        }
    }

    static async getFileByLanguage(language){
        try {
            if(!language || typeof language !== "string" ){
                throw new ServerError(400, "Language must be a non-empty string")
            }
            const fileFound = await FileRepository.getFilesByLanguage(language)
            if(!fileFound){
                throw new ServerError(404, "File not found by language")
            }
            return fileFound || []
        } catch (error) {
            if (error instanceof ServerError) {
                throw error
            }
            console.error("Unexpected error in FileService ", error.message)
            throw new ServerError(500, error.message || "Error getting File by language")
        }
    }

    static async getFileByProjectAndPath(project_id, path){
        try {
            if(!mongoose.Types.ObjectId.isValid(project_id)){
                throw new ServerError(400, "Invalid project ID" )
            }
            if(!path){
                throw new ServerError(400, "Path is required")
            }
            const fileFound = await FileRepository.getFileByProjectAndPath(project_id, path)
            if(!fileFound){
                throw new ServerError(404, "File not found")
            }
            return fileFound || []
        } catch (error) {
            if (error instanceof ServerError) {
                throw error
            }
            console.error("Unexpected error in FileService ", error.message)
            throw new ServerError(500, error.message || "Error getting File by project and path")
        }
    }

    static async updateFile(file_id, update_data, user){
        try {
            if(!mongoose.Types.ObjectId.isValid(file_id)){
                throw new ServerError(400, "Invalid project ID")
            }
            const file = await FileRepository.getFileById(file_id)
            if(!file){
                throw new ServerError(404, "File not found")
            }
            // Verificar que el usuario sea dueño del proyecto al que pertenece el archivo
            const project = await ProjectRepository.getProjectById(file.project._id)
            if(project.owner._id.toString() !== user._id.toString()){
                throw new ServerError(403, "You can only modify files from your own projects")
            }
            // Si se cambia el path, verificar que no exista otro archivo con ese path
            if(update_data.path && update_data.path !== file.path){
                const existing = await FileRepository.getFileByProjectAndPath(file.project._id, update_data.path)
                if(existing){
                    throw new ServerError(409, "A file with this path already exists in the projects")
                }
            }

            const fileUpdated = await FileRepository.updateFile(file_id, update_data)
            return fileUpdated
        } catch (error) {
            if (error instanceof ServerError) {
                throw error
            }
            console.error("Unexpected error in FileService ", error.message)
            throw new ServerError(500, error.message || "Error update File ")
        }
    }

    static async deleteFile(file_id, user){
        try {
            if(!mongoose.Types.ObjectId.isValid(file_id)){
                throw new ServerError(400, "Invalid file ID")
            }
            const fileToDelete = await FileRepository.getFileById(file_id)
            if(!fileToDelete){
                throw new ServerError(404, "File not found")
            }
            const project = await ProjectRepository.getProjectById(fileToDelete.project._id)
            if(project.owner._id.toString() !== user._id.toString()){
                throw new ServerError(403, "You can only delete files from your own projects")
            }

            const deletedFile = await FileRepository.deleteFile(file_id)
            return deletedFile
        } catch (error) {
            if (error instanceof ServerError) {
                throw error
            }
            console.error("Unexpected error in FileService ", error.message)
            throw new ServerError(500, error.message || "Error deleting File")
        }
    }
}

export default FileService