
const dns = require("dns");

// Fix Node.js DNS resolution for MongoDB Atlas SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoUri =
        process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error(
            "MongoDB connection string is missing. Set MONGO_URI in your .env file."
        );
    }

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 15000
        });

        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};

module.exports = connectDB;
