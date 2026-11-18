
const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
    // Log error in the console
    console.error("Backend Error:", err.message);

    // Save error in app.log
    logger.error(
        `${req.method} ${req.originalUrl} - ${err.message}`
    );

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};

module.exports = errorMiddleware;
