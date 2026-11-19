
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const connectDB = require("./config/db");

const urlRoutes = require("./routes/urlRoutes");
const authRoutes = require("./routes/authRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");
const { redirectUrl } = require("./controllers/urlController");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to LinkLite Backend!");
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "LinkLite Backend is working!"
    });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// URL API routes
app.use("/api/urls", urlRoutes);

// Test error route - MUST be before /:code
app.get("/test-error", (req, res, next) => {
    const error = new Error("This is a test error");
    error.statusCode = 400;
    next(error);
});

// Short URL redirect route - keep last
app.get("/:code", redirectUrl);

// Centralised error middleware - after all routes
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB before starting the server
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`LinkLite server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
