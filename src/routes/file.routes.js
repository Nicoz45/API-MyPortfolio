import { Router } from "express";
import FileController from "../controllers/file.controller";
import { authenticateUser, requiredVerifiedEmail } from "../middlewares/authMiddleware";


export const fileRoutes = Router()

// Ver archivos de un proyecto es público (el service ya valida visibilidad a nivel proyecto)
fileRoutes.get("/:file_id", FileController.getFileById)
fileRoutes.get("/project/:project_id", FileController.getFileByProject)
fileRoutes.get("/language/:language", FileController.getFileByLanguage)
fileRoutes.get("project/:project_id/path", FileController.getFileByProjectAndPath)

// Crear, editar y eliminar requieren auth
fileRoutes.post("/",
    authenticateUser,
    requiredVerifiedEmail,
    FileController.createFile
)

fileRoutes.put("/:file_id",
    authenticateUser,
    requiredVerifiedEmail,
    FileController.updateFile
)

fileRoutes.delete("/:file_id",
    authenticateUser,
    requiredVerifiedEmail,
    FileController.deleteFile
)