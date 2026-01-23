import mongoose from "mongoose"
import connectToMongoDB from "./config/configMongoDB.config.js"
import express from "express"
import cors from "cors"
import mailTransporter from "./config/mailTransporter.config.js"
import ENVIRONMENT from "./config/env.config.js"
import authRoutes from "./routes/auth.routes.js"

// Conectar a MongoDB de forma asincrónica sin bloquear el servidor
connectToMongoDB().catch(err => {
    console.error("MongoDB connection failed, but server will continue:", err.message)
})

const app = express()

app.use(express.json())
app.use(cors())

app.get("/test", (req, res) => {
    res.send("<div style='text-align: center; font-size: 100px'><h1>API My Portfolio</h1></div>")
})

app.get("/status", (req, res) => {
    res.status(200).json({ok: true, message: "Server is running"})
})

app.use("/auth", authRoutes)

const PORT = ENVIRONMENT.PORT || 8080

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

/* mailTransporter.sendMail({
    from: ENVIRONMENT.GMAIL_USER,
    to: "nicolaszarate31@gmail.com",
    subject: "Test Email from My Portfolio API",
    html: `<div style='text-align: center; font-size: 100px; border: 1px solid black; border-radius: 10px; padding: 100px; display: flex; justify-content: center; flex-direction: column'>
    <h1>API My Portfolio</h1>
    </div>`
}) */

