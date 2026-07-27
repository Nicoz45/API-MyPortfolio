import authRoutes from "./routes/auth.routes.js"
import { projectRoutes } from "./routes/project.routes.js"
import { userRoutes } from "./routes/user.routes.js"
import express from "express"
import cors from "cors"

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
app.use("/projects", projectRoutes)
app.use("/user", userRoutes)

export default app