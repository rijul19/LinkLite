
const validateRequest = (schema, source = "body") => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.details.map((detail) => detail.message)
            });
        }

        const key = `validated${source.charAt(0).toUpperCase()}${source.slice(1)}`;
        req[key] = value;

        next();
    };
};

module.exports = validateRequest;
