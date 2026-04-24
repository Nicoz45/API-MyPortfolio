import registerUserCase from "../application/register-user.usecase.js"
import loginUserCase from "../application/login-user.usecase.js"
import AuthService from "../services/auth.service.js"
import { ServerError } from "../services/Error.service.js"

class AuthController {
    static async register(req, res) {
        try {
            console.log("📝 Register request received:", { email: req.body.email, username: req.body.username })
            // Desestructuramos los campos necesarios del cuerpo de la solicitud
            const { email, username, password, repeatPassword } = req.body

            const user = await registerUserCase.execute({ email, username, password, repeatPassword })
            console.log("✅ User registered successfully:", user._id)
            const userinfo = res.status(201).json({
                ok: true,
                message: "User registered successfully. Please verify your email.",
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username
                }
            })
            console.log("Register sucessfully for user: ", user._id)
        } catch (error) {
            console.error("❌ Register error:", error.message)
            console.error("Stack:", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500
            res.status(statusCode).json({
                ok: false,
                message: error.message || "Error registering user",
                status: statusCode
            })
        }
    }

    static async verifyEmail(req, res) {
        try {
            console.log("📝 Email verification request received")
            const { token } = req.params
            await AuthService.verifyEmail(token)
            console.log("✅ Email verified successfully")
            res.status(200).json({
                ok: true,
                message: "Email verified successfully",
                status: 200
            })
        } catch (error) {
            console.error("❌ Email verification error:", error.message)
            console.error("Stack:", error.stack)
            if (error.status) {
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

    static async login(req, res) {
        try {
            const {emailOrUsername, password} = req.body
            const { token, user } = await loginUserCase.execute({emailOrUsername, password})
            const userInfo = res.status(200).json({
                ok: true,
                message: "Login successful",
                token,
                user: { email: user.email, username: user.username }
            })
                console.log("✅ Login successful for user:", user._id)
        } catch (error) {
            console.error("❌ Login error:", error.message)
            console.error("Stack:", error.stack)
            const statusCode = error instanceof ServerError ? error.status : 500
            res.status(statusCode).json({
                ok: false,
                message: error.message || "Error login user",
                status: statusCode
            })
        }
    }
}


export default AuthController