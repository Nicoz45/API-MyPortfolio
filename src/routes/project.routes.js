import { Router } from "express";
import { authenticateUser, requiredVerifiedEmail } from "../middlewares/authMiddleware.js";
import { checkProjectLimits } from "../middlewares/project.middleware.js";
import ProjectController from "../controllers/project.controller.js";


export const projectRoutes = Router()
/*
// Públicas - no requieren autenticación
projectRoutes.get("/public", ProjectController.getPublicProjects)
projectRoutes.get("/tech/:tech", ProjectController.getProjectsByTech)
// opcionalmente buscar por dueño
projectRoutes.get("/owner/:owner", ProjectController.getProjectsByOwner)

// Creación y modificación requieren usuario autenticado */
projectRoutes.post("/",
    authenticateUser,
    requiredVerifiedEmail,
    checkProjectLimits,
    ProjectController.createProject
)
projectRoutes.put("/:id",
    authenticateUser,
    requiredVerifiedEmail,
    ProjectController.updateProject
)
projectRoutes.delete("/:id",
    authenticateUser,
    requiredVerifiedEmail,
    ProjectController.deleteProject
)


