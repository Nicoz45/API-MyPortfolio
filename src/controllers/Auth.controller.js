import registerUserCase from "../application/register-user.usecase.js"
import AuthService from "../services/auth.service.js"
import { ServerError } from "../services/Error.service.js"

class AuthController {
    static async register(req, res){
        try {
            const {email, username, password, repeatPassword} = req.body
            
            const user = await registerUserCase.execute({email, username, password, repeatPassword})
            const userinfo = res.status(201).json({
                ok: true,
                message: "User registered successfully. Please verify your email.",
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username
                }
            })
            console.log(userinfo)
        } catch (error) {
            const statusCode = error instanceof ServerError ? error.status : 500
            res.status(statusCode).json({
                ok: false,
                message: error.message || "Error registering user",
                status: statusCode
            })
        }
    }

    static async verifyEmail(req, res){
        try {
            const {token} = req.params
            await AuthService.verifyEmail(token)
            res.status(200).json({
                ok: true,
                message: "Email verified successfully",
                status: 200
            })
        } catch (error) {
            if(error.status){
                res.send({
                    ok: false,
                    message: error.message,
                    status: error.status
                })
            } else {                
                res.status(500).json({
                    ok: false,
                    message: error.message || "Error verifying email",
                    status: 500
                })
            }
        }
    }
}

export default AuthController