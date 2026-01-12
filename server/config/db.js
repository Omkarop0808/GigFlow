import mongoose from "mongoose";
import { ENV } from "../config/env.js";

const MONGO_URL= ENV.MONGO_URL;

export const connectDB= async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
};