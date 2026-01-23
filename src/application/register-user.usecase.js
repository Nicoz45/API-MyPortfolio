import AuthService from "../services/auth.service.js";
import { ServerError } from "../services/Error.service.js";

class registerUserCase {
    static async execute(userData){
        try {
            return await AuthService.register(userData)
        } catch (error) {
            if (error instanceof ServerError) {
                throw error
            }
            throw new ServerError(500, error.message || 'Internal error registering user')
        }
    }
}

export default registerUserCase