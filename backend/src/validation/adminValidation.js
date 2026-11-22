
const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const adminListSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().trim().max(100).allow("").default("")
});

const userIdParamSchema = Joi.object({
    id: objectId.required()
});

const codeParamSchema = Joi.object({
    code: Joi.string()
        .trim()
        .pattern(/^[A-Za-z0-9_-]{3,30}$/)
        .required()
});

const roleSchema = Joi.object({
    role: Joi.string().valid("user", "admin").required()
});

module.exports = {
    adminListSchema,
    userIdParamSchema,
    codeParamSchema,
    roleSchema
};
