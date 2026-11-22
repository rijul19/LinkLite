
const Joi = require("joi");

const urlSchema = Joi.object({
    originalUrl: Joi.string()
        .trim()
        .uri({ scheme: ["http", "https"] })
        .required()
        .messages({
            "string.empty": "Original URL is required",
            "string.uri": "Please provide a valid HTTP or HTTPS URL",
            "any.required": "Original URL is required"
        })
});

const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
});

// Validate click analytics date range
const clicksQuerySchema = Joi.object({
    days: Joi.number()
        .integer()
        .min(1)
        .max(90)
        .default(30)
});

module.exports = {
    urlSchema,
    paginationSchema,
    clicksQuerySchema
};
