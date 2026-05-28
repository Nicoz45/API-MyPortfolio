import {Router} from "express";
import { authenticateUser, requiredMinRole } from "../middlewares/authMiddleware.js";
import { ROLES } from "../constants/roles.constants.js";
import UserController from "../controllers/user.controller.js";

export const userRoutes = Router();

console.log("✅ user Routes initialized");

// solo admins pueden ver/crear/borrar usuarios directamente
userRoutes.post("/", 
    authenticateUser,
    requiredMinRole(ROLES.ADMIN),
    UserController.createUser
)

userRoutes.get("/", 
    authenticateUser,
    requiredMinRole(ROLES.ADMIN),
    UserController.getAll
)

userRoutes.get("/email/:email",
    authenticateUser,
    requiredMinRole(ROLES.MOD),
    UserController.getByEmail
)

// eL GET por username va a ser publico (portafolio)
userRoutes.get("/username/:username",
    UserController.getByUsername
)

userRoutes.get("/:user_id",
    authenticateUser,
    UserController.getById
)

userRoutes.put("/:user_id",
    authenticateUser,
    UserController.updateById
)

userRoutes.delete("/:user_id",
    authenticateUser,
    requiredMinRole(ROLES.ADMIN),
    UserController.deleteById
)


