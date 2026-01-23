import UserRepository from "../repositories/user.repository.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import ENVIRONMENT from "../config/env.config.js";
import EmailService from "./email.service.js";
import { ServerError } from "./Error.service.js";

class AuthService {
    static async register({email, username, password, repeatPassword}){
        if(password !== repeatPassword){
            throw new Error("Passwords do not match")
        }
        const existingUser = await UserRepository.getByEmail(email)
        if (existingUser){
            throw new Error("User already exists")
        }

        const hashedPassword = await bcrypt.hash(password, 24)

        const userCreated = await UserRepository.createUser({
            username: username,
            email: email,
            passwordHash: hashedPassword,
            verified_email: false
        })

        const token = jwt.sign({user_id: userCreated._id}, ENVIRONMENT.JWT_SECRET, {expiresIn: '24hs'})

        await EmailService.sendVerificationEmail(email, token)
        console.log(userCreated)
        return userCreated
    }

    static async verifyEmail(token){
        try {
            const paylod = jwt.verify(token, ENVIRONMENT.JWT_SECRET)
            const {user_id} = paylod
            if(!user_id){
                throw new ServerError(400, "Invalid token")
            }
            await UserRepository.updateById(user_id, {verified_email: true})
            return
        } catch (error) {
            if(error instanceof jwt.JsonWebTokenError){
                throw new ServerError(400, "Invalid token")
            }
            throw error
        }
    }
}

export default AuthService