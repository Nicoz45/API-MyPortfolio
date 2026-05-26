import { Router } from "express";
import { authenticateUser, requiredVerifiedEmail } from "../middlewares/authMiddleware.js";
import { canModifyProjet, canViewProject, checkProjectLimits, loadProject } from "../middlewares/project.middleware.js";
import ProjectController from "../controllers/project.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createProjectSchema, updateProjectSchema } from "../schemas/project.schema.js";


export const projectRoutes = Router()

// Públicas - no requieren autenticación
projectRoutes.get("/public", ProjectController.getPublicProjects)
projectRoutes.get("/tech/:tech", ProjectController.getProjectsByTech)
// opcionalmente buscar por dueño
projectRoutes.get("/owner/:owner", ProjectController.getByOwner)

// GET / :id > carga el proyecto, verifica visibilidad
projectRoutes.get("/:id",
    loadProject,
    canViewProject,
    ProjectController.getById
)

// Creación y modificación requieren usuario autenticado */
projectRoutes.post("/",
    authenticateUser,
    requiredVerifiedEmail,
    checkProjectLimits,
    validateRequest(createProjectSchema),
    ProjectController.createProject
)

projectRoutes.put("/:id",
    authenticateUser,
    requiredVerifiedEmail,
    loadProject,
    canModifyProjet,
    validateRequest(updateProjectSchema),
    ProjectController.updateProject
)

projectRoutes.delete("/:id",
    authenticateUser,
    requiredVerifiedEmail,
    ProjectController.deleteProject
)

// Star / unstar
projectRoutes.post("/:id/star",
    authenticateUser,
    requiredVerifiedEmail,
    loadProject,
    canViewProject,
    ProjectController.toggleStar
)


