import mongoose from "mongoose";
import ENVIRONMENT from "./env.config.js";

async function connectToMongoDB(){
    try {
        const connectionString = ENVIRONMENT.DB_LOCAL_HOST + "/" + ENVIRONMENT.DB_NAME
        await mongoose.connect(connectionString);
        console.log(`Connect to MongoDB ${ENVIRONMENT.DB_NAME} database`);
    } catch (error) {
        console.error("Error to connect to MongoDB", error)
        throw new Error("Could not connect to the database")
    }
}

export default connectToMongoDB