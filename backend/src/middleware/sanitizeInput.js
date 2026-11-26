
const sanitizeObject = (value) => {
    if (Array.isArray(value)) {
        return value.map(sanitizeObject);
    }

    if (value !== null && typeof value === "object") {
        const sanitized = {};

        for (const [key, item] of Object.entries(value)) {
            // Remove MongoDB operators and dotted keys
            if (key.startsWith("$") || key.includes(".")) {
                continue;
            }

            sanitized[key] = sanitizeObject(item);
        }

        return sanitized;
    }

    return value;
};

const sanitizeInput = (req, res, next) => {
    if (
        req.body &&
        typeof req.body === "object" &&
        !Array.isArray(req.body)
    ) {
        req.body = sanitizeObject(req.body);
    }

    next();
};

module.exports = sanitizeInput;
