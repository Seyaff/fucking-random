import mongoose from "mongoose";
import { Env } from "./app.config";

 const connectDatabase = async () => {
    try {
        
        const conn = await mongoose.connect(Env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        });
        console.info(`Database Online: ${conn.connection.host}`);
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};


export default connectDatabase