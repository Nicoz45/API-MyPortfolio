import ENVIRONMENT from "../config/env.config.js";
import mailTransporter from "../config/mailTransporter.config.js";

class EmailService {
    static async sendVerificationEmail(email, token) {
        try {
            const verificationURL = `http://localhost:${ENVIRONMENT.PORT}/auth/verify-email/${token}`;

            await mailTransporter.sendMail({
                from: ENVIRONMENT.GMAIL_USER,
                to: email,
                subject: "Email Verification - My Portfolio",
                html: `<div style='text-align: center; font-size: 20px; border: 1px solid black; border-radius: 10px; padding: 50px; display: flex; justify-content: center; flex-direction: column'>
                <h1>My Portfolio</h1>
                <a href="${verificationURL}">Verify your email</a>
                </div>`
            })
            console.log("Verification email sent to:", email)
        } catch (error) {
            console.error("Error sending verification email:", error.message)
            if (error.status) {
                return {
                    ok: false,
                    message: error.message,
                    status: error.status
                } 
            }
            else({
                ok: false,
                message: "Internal Server Error",
                status: 500
            })
    }
}
}

export default EmailService