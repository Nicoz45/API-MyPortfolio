import UserRepository from "../repositories/user.repository.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import ENVIRONMENT from "../config/env.config.js";
import EmailService from "./email.service.js";
import { ServerError } from "./Error.service.js";

class AuthService {
    static async register({email, username, password, repeatPassword}){
        console.log("🔐 AuthService.register() called for:", email)
        if(password !== repeatPassword){
            console.error("❌ Passwords do not match")
            throw new Error("Passwords do not match")
        }
        const existingUser = await UserRepository.getByEmail(email)
        console.log("📋 Checking if user exists:", !!existingUser)
        if (existingUser){
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
        const token = jwt.sign({user_id: userCreated._id}, ENVIRONMENT.JWT_SECRET, {expiresIn: '24h'})
        console.log("✅ Token generated")

        console.log("📧 Sending verification email to:", email)
        await EmailService.sendVerificationEmail(email, token)
        console.log("✅ Verification email sent")
        return userCreated
    }

    static async verifyEmail(token){
        try {
            console.log("🔐 AuthService.verifyEmail() called")
            console.log("🎫 Verifying JWT token...")
            const payload = jwt.verify(token, ENVIRONMENT.JWT_SECRET)
            const {user_id} = payload
            console.log("✅ Token verified. User ID:", user_id)
            if(!user_id){
                console.error("❌ Invalid token - no user_id in payload")
                throw new ServerError(400, "Invalid token")
            }
            console.log("💾 Updating user verification status...")
            await UserRepository.updateById(user_id, {verified_email: true})
            console.log("✅ Email verified successfully for user:", user_id)
            return
        } catch (error) {
            if(error instanceof jwt.JsonWebTokenError){
                console.error("❌ JWT verification failed:", error.message)
                throw new ServerError(400, "Invalid token")
            }
            console.error("❌ Unexpected error in verifyEmail:", error.message)
            console.error("Stack:", error.stack)
            throw error
        }
    }
}

export default AuthService