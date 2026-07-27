import connectToMongoDB from "./config/configMongoDB.config.js"
import ENVIRONMENT from "./config/env.config.js"
import app from "./app.js"

// Conectar a MongoDB de forma asincrónica sin bloquear el servidor
connectToMongoDB().catch(err => {
    console.error("❌ MongoDB connection failed, but server will continue:", err.message)
    console.error("Stack:", err.stack)
})

const PORT = ENVIRONMENT.PORT || 8080

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`)
})

