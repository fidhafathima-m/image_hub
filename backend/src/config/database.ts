import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }

        await mongoose.connect(mongoURI);
        console.log("MongoDB connected successfully!");
        
        // Connection event handlers
        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("MongoDB disconnected");
        });

        // Graceful shutdown
        process.on("SIGINT", async () => {
            await mongoose.connection.close();
            console.log("MongoDB connection closed due to app termination");
            process.exit(0);
        });
    } catch (error: unknown) {
        console.error("Error connecting to database: ", error);
        process.exit(1);
    }
};