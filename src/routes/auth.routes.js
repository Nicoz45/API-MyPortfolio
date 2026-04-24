import { Router } from "express";
import { validateRequest } from "../middlewares/validateRequest.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import AuthController from "../controllers/Auth.controller.js";


const authRoutes = Router()

console.log("✅ Auth routes initialized")

authRoutes.post("/login",
    validateRequest(loginSchema),
    AuthController.login
)

authRoutes.post("/register",
    validateRequest(registerSchema),
    AuthController.register
)

authRoutes.get("/verify-email/:token",
    AuthController.verifyEmail
)

export default authRoutes