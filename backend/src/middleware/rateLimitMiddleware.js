const rateLimit = require("express-rate-limit");

const createUrlLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // Maximum 10 requests
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many URL creation requests. Please try again after 15 minutes."
    }
});

module.exports = { createUrlLimiter };