import AuthService from "../services/auth.service.js";
import { ServerError } from "../services/Error.service.js";

class loginUserUseCase{
    static async execute(userData){
        try {
            return await AuthService.login(userData)
        } catch (error) {
            /* if (error instanceof ServerError) {
                console.error(error)
                throw error
            } */
            console.error(error.message)
            throw new ServerError(500, error.message || 'Internal error logging in')
        }
    }

}

export default loginUserUseCase