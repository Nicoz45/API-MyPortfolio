import UserRepository from "../repositories/user.repository.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import ENVIRONMENT from "../config/env.config.js";
import EmailService from "./email.service.js";
import { ServerError } from "./Error.service.js";

class AuthService {
    static async register({ email, username, password, repeatPassword }) {
        console.log("🔐 AuthService.register() called for: ", email )
        if (password !== repeatPassword) {
            console.error("❌ Passwords do not match")
            throw new Error("Passwords do not match")
        }
        const existingUser = await UserRepository.getByEmail(email)
        console.log("📋 Checking if user exists:", !!existingUser)
        if (existingUser) {
            console.error("❌ User already exists:", email)
            throw new Error("User already exists")
        }

        console.log("🔒 Hashing password...")
        const hashedPassword = await bcrypt.hash(password, 12)
        console.log("✅ Password hashed successfully")

        console.log("💾 Creating user in database...")
        const userCreated = await UserRepository.createUser({
            username: username,
            email: email,
            passwordHash: hashedPassword,
            verified_email: false
        })
        console.log("✅ User created with ID:", userCreated._id)

        console.log("🎫 Generating JWT token...")
        const token = jwt.sign({ user_id: userCreated._id }, ENVIRONMENT.JWT_SECRET, { expiresIn: '24h' })
        console.log("✅ Token generated")

        const safeUser = (typeof userCreated.toObject === 'function')
            ? userCreated.toObject()
            : { ...userCreated}
        if(safeUser.passwordHash) delete safeUser.passwordHash

        console.log("📧 Sending verification email to:", email)
        await EmailService.sendVerificationEmail(email, token)
        console.log("✅ Verification email sent")
        return {token, user: safeUser}
    }

    static async verifyEmail(token) {
        try {
            console.log("🔐 AuthService.verifyEmail() called")
            console.log("🎫 Verifying JWT token...")
            const payload = jwt.verify(token, ENVIRONMENT.JWT_SECRET)
            const { user_id } = payload
            console.log("✅ Token verified. User ID:", user_id)
            if (!user_id) {
                console.error("❌ Invalid token - no user_id in payload")
                throw new ServerError(400, "Invalid token")
            }
            console.log("💾 Updating user verification status...")
            await UserRepository.updateById(user_id, { verified_email: true })
            console.log("✅ Email verified successfully for user:", user_id)
            return
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                console.error("❌ JWT verification failed:", error.message)
                throw new ServerError(400, "Invalid token")
            }
            console.error("❌ Unexpected error in verifyEmail:", error.message)
            console.error("Stack:", error.stack)
            throw error
        }
    }

    static async login({ emailOrUsername, password }) {
        try {
            // Validamos que se hayan proporcionado email/username y contraseña, si no es así, lanzamos un error 400 (bad request)
            if (!emailOrUsername || !password) {
                throw new ServerError(400, 'Email/username and password are required')
            }
            // Determinamos si el identificador es un email o un username
            const identifier = emailOrUsername.includes('@') ? 'email' : 'username'

            // Buscamos el usuario por email o username
            const userFound = identifier === 'email'
                ? await UserRepository.getByEmail(emailOrUsername)
                : await UserRepository.getByUsername(emailOrUsername)

            // Si no se encuentra el usuario, lanzamos un error 404(not found)
            if(!userFound){
                console.error("❌ User not found with identifier:", emailOrUsername)
                throw new ServerError(404, "User not found")
            }

            // Verificamos que el usuario haya confirmado su email, si no es así, lanzamos un error 403 (forbidden)
            if(!userFound.verified_email){
                console.error("❌ Email not verified for user:", emailOrUsername)
                throw new ServerError(403, 'Email not verified. Please verify your email before logging in.')
            }
            // Comparamos la contraseña proporcionada con el hash almacenado
            const passwordMatch = await bcrypt.compare(password, userFound.passwordHash)
            // Si la contraseña no coincide, lanzamos un error 401(unauthorized)
            if(!passwordMatch){
                console.error("❌ Incorrect password for user: ", emailOrUsername)
                throw new ServerError(401, 'Incorrect Password')
            }

            // Si todo es correcto, generamos un token JWT con la información del usuario
            const token = jwt.sign({
                user_id: userFound._id,
                email: userFound.email,
                username: userFound.username
            }, ENVIRONMENT.JWT_SECRET, { expiresIn: '24h' })

            // Devolvemos el token y la información del usuario (sin el hash de la contraseña)
            const safeUser = (typeof userFound.toObject === 'function')
                ? userFound.toObject()
                : { ...userFound }
                // Eliminamos el hash de la contraseña antes de devolver la información del usuario
            if (safeUser.passwordHash) delete safeUser.passwordHash
            return { token, user: safeUser }


        } catch (error) {
            if(error instanceof ServerError){
                throw error
            }
            else{
                console.error("❌ Unexpected error in login:", error.message)
                console.error("Stack:", error.stack)
                throw new ServerError(500, error.message || 'Internal error logging in')    
            }
        }
    }
}


export default AuthService