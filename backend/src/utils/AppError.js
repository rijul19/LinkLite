
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);

        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
}

class ValidationError extends AppError {
    constructor(message = "Invalid input") {
        super(message, 400);
    }
}

class AuthError extends AppError {
    constructor(message = "Authentication required") {
        super(message, 401);
    }
}

module.exports = {
    AppError,
    NotFoundError,
    ValidationError,
    AuthError
};
