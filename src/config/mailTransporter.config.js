import ENVIRONMENT from "./env.config.js";
import nodemailer from "nodemailer";

const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: ENVIRONMENT.GMAIL_USER,
        pass: ENVIRONMENT.GMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
})

export default mailTransporter