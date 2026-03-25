import mongoose, { Connection } from "mongoose";

let isConnected: Connection | boolean = false;

const connectDB = async () => {
    if (isConnected) return isConnected;
    try {
        const res = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/lawsa-socials");
        isConnected = res.connection;
        console.log("MongoDB connected.");
        return isConnected;
    } catch (error) {
        console.log("MongoDB connection error:", error);
        throw error;
    }
};

export default connectDB;
