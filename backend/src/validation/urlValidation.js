
const Joi = require("joi");

// Validate URL creation and update requests
const urlSchema = Joi.object({
    originalUrl: Joi.string()
        .trim()
        .uri({
            scheme: ["http", "https"]
        })
        .required()
        .messages({
            "string.empty": "Original URL is required",
            "string.uri": "Please provide a valid HTTP or HTTPS URL",
            "any.required": "Original URL is required"
        }),

    // Optional URL expiration date
    expiresAt: Joi.date()
        .iso()
        .allow(null)
        .optional()
        .messages({
            "date.base": "Expiration date must be a valid date",
            "date.format": "Expiration date must use ISO date format"
        })
});

// Validate pagination query parameters
const paginationSchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
});

// Validate click analytics query parameters
const clickAnalyticsSchema = Joi.object({
    days: Joi.number()
        .integer()
        .min(1)
        .max(90)
        .default(30)
});

module.exports = {
    urlSchema,
    paginationSchema,
    clicksQuerySchema: clickAnalyticsSchema
};
