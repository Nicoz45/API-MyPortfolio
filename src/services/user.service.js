import { object } from "joi";
import UserRepository from "../repositories/user.repository.js";
import { ServerError } from "./Error.service.js";


class UserService{
    static async createUser(userData){
        try {
            if(!userData){
                throw new ServerError(400, "User data is required")
            }
            const {email, username, password} = userData
            if(!email || !username || !password){
                throw new ServerError(400, "Email, username and password are required")
            }
            const userCreated = await UserRepository.createUser(userData);
            return userCreated
            
        } catch (error) {
            if (error instanceof ServerError){
                throw error
            }
            console.error("Unexpected error in UserService")
            throw new ServerError(500, error.message || "Error creating user")
        }

    }

    static async getById(user_id){
        try {
            const userFound = await UserRepository.getById(user_id)
            if(!userFound){
                throw new ServerError(404, "User not found")
            }
            return userFound
        } catch (error) {
            if (error instanceof ServerError){
                throw error
            }
            console.error("Unexpected error in UserService")
            throw new ServerError(500, error.message || "Error geting User by ID")
        }
    }
}