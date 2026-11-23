
const Joi = require("joi");

const password = Joi.string().min(8).max(72);
const name = Joi.string().trim().min(2).max(50);
const email = Joi.string().trim().lowercase().email().max(254);

const registerSchema = Joi.object({
    name: name.required(),
    email: email.required(),
    password: password.required()
});

const loginSchema = Joi.object({
    email: email.required(),
    password: Joi.string().max(72).required()
});

const updateProfileSchema = Joi.object({
    name,
    email
}).or("name", "email");

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().max(72).required(),
    newPassword: password
        .invalid(Joi.ref("currentPassword"))
        .required()
});

module.exports = {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    changePasswordSchema
};

