import User from "../Models/User.model.js";

class UserRepository {
    static async createUser(userData){
        try {
            const user = await User.insertOne(userData)
            console.log("User created:", user)
            return user
        } catch (error) {
            console.error("Error creating user:", error)
            throw new Error("Could not create user")
        }
    }

    static async getById(user_id){
        try {
            const userFound = await User.findById(user_id)
            return userFound
        } catch (error) {
            console.error("Error getting user by ID:", error)
            throw new Error("Could not get user by ID")
        }
    }

    static async getAll(){
        try {
            const allUsers = await User.find({active: true})
            return allUsers
        } catch (error) {
            console.error("Error getting all users:", error)
            throw new Error("Could not get all users")
        }
    }

    static async getByEmail(email){
        try {
            const userFound = await User.findOne({email: email, active: true})
            return userFound
        } catch (error) {
            console.error("Error getting user by email:", error)
            throw new Error("Could not get user by email")
        }
    }

    static async deleteById(user_id){
        try {
            const result = await User.findByIdAndDelete(user_id)
            return result
        } catch (error) {
            console.error("Error deleting user by ID:", error)
            throw new Error("Could not delete user by ID")
        }
    }

    static async updateById(user_id, update_user){
        try {
            const userUpdated = await User.findByIdAndUpdate(user_id, update_user)
            return userUpdated
        } catch (error) {
            console.error("Error updating user by ID:", error)
            throw new Error("Could not update user by ID")
        }
    }
}

export default UserRepository