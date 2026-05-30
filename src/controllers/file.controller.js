import FileService from "../services/file.service.js"


class FileController {
    static async createFile(req, res) {
        try {
            const { file_data } = req.body
            const fileCreated = await FileService.createFile(file_data, req.user)
            console.log("File created successfully")

            return res.status(201).json({
                ok: true,
                message: "File created successfully",
                file: fileCreated,
                status: 201
            })
        } catch (error) {
            console.error("Created file error", error.message)
            console.error("Stack: ", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500
            return res.status(statusCode).json({
                ok: false,
                message: error.message || "Error creating file",
                status: statusCode
            })
        }
    }

    static async getFileById(req, res) {
        try {
            const { file_id } = req.params
            const fileSelected = await FileService.getFileById(file_id)
            return res.status(200).json({
                ok: true,
                message: "File successfully obtained",
                file: fileSelected,
                status: 200
            })
        } catch (error) {
            console.error("Get file error", error.message)
            console.error("Stack: ", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500
            return res.status(statusCode).json({
                ok: false,
                message: error.message || "Error getting file",
                status: statusCode
            })
        }
    }

    static async getFileByProject(req, res) {
        try {
            const { project_id } = req.params
            const files = await FileService.getFileByProject(project_id)
            return res.status(200).json({
                ok: true,
                message: "File successfully obtained by project",
                file: files,
                status: 200,
            })
        } catch (error) {
            console.error("Get file error", error.message)
            console.error("Stack: ", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500
            return res.status(statusCode).json({
                ok: false,
                message: error.message || "Error getting file",
                status: statusCode
            })
        }
    }

    static async getFileByLanguage(req, res) {
        try {
            const { language } = req.params
            const file = await FileService.getFileByLanguage(language)
            return res.status(200).json({
                ok: true,
                message: "File successfully obtained by language",
                file: file,
                status: 200
            })
        } catch (error) {
            console.error("Get file error", error.message)
            console.error("Stack: ", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500
            return res.status(statusCode).json({
                ok: false,
                message: error.message || "Error getting file",
                status: statusCode
            })
        }
    }

    static async getFileByProjectAndPath(req, res) {
        try {
            const { project_id } = req.params
            const { path } = req.query
            const file = await FileService.getFileByProjectAndPath(project_id, path)
            return res.status(200).json({
                ok: true,
                message: "File successfully obtained",
                file: file,
                status: 200
            })
        } catch (error) {
            console.error("Get file error", error.message)
            console.error("Stack: ", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500
            return res.status(statusCode).json({
                ok: false,
                message: error.message || "Error getting file",
                status: statusCode
            })
        }
    }

    static async updateFile(req, res) {
        try {
            const { file_id } = req.params
            const { update_data } = req.body
            const fileUpdated = await FileService.updateFile(file_id, update_data, req.user)
            return res.status(200).json({
                ok: true,
                message: "File updated successfully",
                fileUpdated: fileUpdated,
                status: 200
            })
        } catch (error) {
            console.error("Updated file error", error.message)
            console.error("Stack: ", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500
            return res.status(statusCode).json({
                ok: false,
                message: error.message || "Error updated file",
                status: statusCode
            })
        }
    }

    static async deleteFile(req, res) {
        try {
            const { file_id } = req.params
            const fileDeleted = await FileService.deleteFile(file_id, req.user)
            return res.status(200).json({
                ok: true,
                message: "File successfully deleted",
                fileDeleted: fileDeleted,
                status: 200
            })
        } catch (error) {
            console.error("Updated file error", error.message)
            console.error("Stack: ", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500
            return res.status(statusCode).json({
                ok: false,
                message: error.message || "Error updated file",
                status: statusCode
            })
        }
    }
}

export default FileController