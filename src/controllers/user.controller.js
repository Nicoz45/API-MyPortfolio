import { ServerError } from "../services/Error.service.js";
import UserService from "../services/user.service.js";


class UserController {
    static async createUser(req, res) {
        try {
            const userData = req.body;
            const userCreated = await UserService.createUser(userData)
            return res.status(201).json({
                ok: true,
                user: {
                    id: userCreated._id,
                    email: userCreated.email,
                    username: userCreated.username,
                },
                status: 201,
                message: "User created successfully"
            })
        }
        catch (error) {
            console.error("Created user error", error.message)
            console.error("Stack: ", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500
            return res.status(statusCode).json({
                ok: false,
                message: error.message || "Error creating User",
                status: statusCode
            })
        }
    }

    static async getAll(req, res) {
        try {
            const allUsers = await UserService.getAllUsers()
            return res.status(201).json({
                ok: true,
                message: "Users successfully acquired",
                status: 201,
                users: allUsers
            })
        } catch (error) {
            console.error("Error geting all users", error.message)
            console.error("Stack: ", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500;
            return res.status(statusCode).json({
                ok: false,
                message: error.message || "Error fetching users",
                status: statusCode
            })
        }
    }

    static async getById(req, res) {
        try {
            const { user_id } = req.params
            const userFound = await UserService.getById(user_id)
            return res.status(201).json({
                ok: true,
                message: "User successfully acquired",
                status: 201,
                user: userFound
            })
        } catch (error) {
            console.error("Error retrieving the user", error.message)
            console.error("Stack: ", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500;
            return res.status(statusCode).json({
                ok: false,
                message: error.message,
                status: statusCode
            })
        }
    }

    static async getByEmail(req, res) {
        try {
            const { email } = req.params
            const userFound = await UserService.getByEmail(email)
            return res.status(201).json({
                ok: true,
                message: "User successfully acquired",
                status: 201,
                user: userFound
            })
        } catch (error) {
            console.error("Error retrieving the user", error.message)
            console.error("Stack: ", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500;
            return res.status(statusCode).json({
                ok: false,
                message: error.message,
                status: statusCode
            })
        }
    }

    static async getByUsername(req, res) {
        try {
            const { username } = req.params
            const userFound = await UserService.getByUsername(username)
            return res.status(201).json({
                ok: true,
                message: "User successfully adquired",
                status: 201,
                user: userFound
            })
        } catch (error) {
            console.error("Error retrieving the user", error.message)
            console.error("Stack: ", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500;
            return res.status(statusCode).json({
                ok: false,
                message: error.message,
                status: statusCode
            })
        }
    }

    static async deleteById(req, res) {
        try {
            const { user } = req.body
            const userToDelete = await UserService.deleteUserById(user._id)
            return res.status(200).json({
                ok: true,
                message: "User successfully removed",
                status: 200,
                userDeleting: userToDelete
            })
        } catch (error) {
            console.error("Error retrieving the user", error.message)
            console.error("Stack: ", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500;
            return res.status(statusCode).json({
                ok: false,
                message: error.message,
                status: statusCode
            })
        }
    }

    static async updateById(req, res) {
        try {
            const { user } = req
            const { update_user } = req.body
            const userUpdated = await UserService.updateById(user._id, update_user)
            return res.status(200).json({
                ok: true,
                message: "User successfully updated",
                status: 200,
                userUpdated: userUpdated
            })
        } catch (error) {
            console.error("Error retrieving the user", error.message)
            console.error("Stack: ", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500;
            return res.status(statusCode).json({
                ok: false,
                message: error.message,
                status: statusCode
            })
        }
    }
}