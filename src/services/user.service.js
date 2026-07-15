import UserRepository from "../repositories/user.repository.js";
import { ServerError } from "./Error.service.js";
import mongoose from "mongoose";

class UserService {
    static async createUser(userData) {
        try {
            if (!userData || typeof userData !== "object" || Array.isArray(userData)) {
                throw new ServerError(400, "User data is required");
            }
            const existingEmail = await UserRepository.getByEmail(userData.email);
            if (existingEmail) {
                throw new ServerError(400, "Email already in use");
            }

            const existingUsername = await UserRepository.getByUsername(userData.username);
            if (existingUsername) {
                console.error(400, "Username already in use")
                throw new ServerError(400, "Username already in use");
            }

            const userCreated = await UserRepository.createUser(userData);
            return userCreated;
        } catch (error) {
            if (error instanceof ServerError) {
                throw error;
            }
            console.error("Unexpected error in UserService.createUser:", error);
            throw new ServerError(500, error.message || "Error creating user");
        }
    }

    static async getById(user_id) {
        try {
            const userFound = await UserRepository.getById(user_id);
            if (!userFound) {
                throw new ServerError(404, "The User ID does not exist");
            }
            return userFound;
        } catch (error) {
            if (error instanceof ServerError) {
                throw error;
            }
            console.error("Unexpected error in UserService.getById:", error);
            throw new ServerError(500, error.message || "Error getting user by ID");
        }
    }

    static async getAllUsers() {
        try {
            const allUsers = await UserRepository.getAll();
            return allUsers;
        } catch (error) {
            if (error instanceof ServerError) {
                throw error;
            }
            console.error("Unexpected error in UserService.getAllUsers:", error);
            throw new ServerError(500, error.message || "Error getting all users");
        }
    }

    static async getByEmail(email) {
        try {
            if (!email) {
                throw new ServerError(400, "Email is required");
            }
            const userFound = await UserRepository.getByEmail(email);
            return userFound;
        } catch (error) {
            if (error instanceof ServerError) {
                throw error;
            }
            console.error("Unexpected error in UserService.getByEmail:", error);
            throw new ServerError(500, error.message || "Error getting user by email");
        }
    }

    static async getByUsername(username) {
        try {
            if (!username) {
                throw new ServerError(400, "Username is required");
            }
            const userFound = await UserRepository.getByUsername(username);
            return userFound;
        } catch (error) {
            if (error instanceof ServerError) {
                throw error;
            }
            console.error("Unexpected error in UserService.getByUsername:", error);
            throw new ServerError(500, error.message || "Error getting user by username");
        }
    }

    static async deleteUserById(user_id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(user_id)) {
                console.error("Invalid user ID")
                throw new ServerError(400, "Invalid user ID");
            }
            const userToDelete = await UserRepository.getById(user_id);
            if (!userToDelete) {
                throw new ServerError(404, "User not found");
            }
            await UserRepository.deleteById(user_id);
            return userToDelete;
        } catch (error) {
            if (error instanceof ServerError) {
                throw error;
            }
            console.error("Unexpected error in UserService.deleteUserById:", error);
            throw new ServerError(500, error.message || "Error deleting user");
        }
    }

    static async updateUser(user_id, update_user) {
        try {
            if (!mongoose.Types.ObjectId.isValid(user_id)) {
                throw new ServerError(400, "Invalid user ID");
            }
            if (!update_user || typeof update_user !== "object" || Array.isArray(update_user)) {
                throw new ServerError(400, "Update data is required");
            }

            const existingUser = await UserRepository.getById(user_id);
            if (!existingUser) {
                throw new ServerError(404, "User not found");
            }

            if (update_user.email && update_user.email !== existingUser.email) {
                const emailUsed = await UserRepository.getByEmail(update_user.email);
                if (emailUsed) {
                    throw new ServerError(400, "Email already in use");
                }
            }

            if (update_user.username && update_user.username !== existingUser.username) {
                const usernameUsed = await UserRepository.getByUsername(update_user.username);
                if (usernameUsed) {
                    throw new ServerError(400, "Username already in use");
                }
            }

            const userUpdated = await UserRepository.updateById(user_id, update_user);
            if (!userUpdated) {
                throw new ServerError(404, "User not found");
            }
            return userUpdated;
        } catch (error) {
            if (error instanceof ServerError) {
                throw error;
            }
            console.error("Unexpected error in UserService.updateUser:", error);
            throw new ServerError(500, error.message || "Error updating user");
        }
    }
}

export default UserService;
