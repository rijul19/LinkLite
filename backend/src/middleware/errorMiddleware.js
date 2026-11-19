
const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose validation errors
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map(error => error.message)
            .join(", ");
    }

    // Duplicate MongoDB values (for example, an existing email)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || "Field";
        message = `${field} already exists`;
    }

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    // JWT errors
    if (
        err.name === "JsonWebTokenError" ||
        err.name === "TokenExpiredError"
    ) {
        statusCode = 401;
        message = "Invalid or expired token";
    }

    // Log the original error for debugging
    console.error("Backend Error:", err);

    logger.error(
        `${req.method} ${req.originalUrl} - ${err.message}`
    );

    // Hide internal error details in production
    if (statusCode >= 500 && process.env.NODE_ENV === "production") {
        message = "Internal Server Error";
    }

    return res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorMiddleware;
