
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// Validate registration input
const validateRegisterInput = (name, email, password) => {
    const errors = {};

    if (typeof name !== "string" || !name.trim()) {
        errors.name = "Name is required";
    } else if (name.trim().length < 2 || name.trim().length > 50) {
        errors.name = "Name must be between 2 and 50 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (typeof email !== "string" || !email.trim()) {
        errors.email = "Email is required";
    } else if (!emailRegex.test(email.trim())) {
        errors.email = "Please provide a valid email address";
    }

    if (typeof password !== "string" || !password) {
        errors.password = "Password is required";
    } else if (password.length < 8) {
        errors.password = "Password must contain at least 8 characters";
    }

    return errors;
};

// Validate login input
const validateLoginInput = (email, password) => {
    const errors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (typeof email !== "string" || !email.trim()) {
        errors.email = "Email is required";
    } else if (!emailRegex.test(email.trim())) {
        errors.email = "Please provide a valid email address";
    }

    if (typeof password !== "string" || !password) {
        errors.password = "Password is required";
    }

    return errors;
};

// Register a new user
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const errors = validateRegisterInput(name, email, password);

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // Role is assigned by the model, never by the request
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password
        });

        const token = generateToken(user._id);

        return res.status(201).json({
            success: true,
            message: "Registration successful.",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        next(error);
    }
};

// Login an existing user
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const errors = validateLoginInput(email, password);

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        }).select("+password");

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = generateToken(user._id);

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        next(error);
    }
};

// Get currently logged-in user's profile
const getMe = async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            data: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// Update logged-in user's profile
const updateProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const updates = {};

        if (name !== undefined) {
            if (
                typeof name !== "string" ||
                name.trim().length < 2 ||
                name.trim().length > 50
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Name must be between 2 and 50 characters."
                });
            }

            updates.name = name.trim();
        }

        if (email !== undefined) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                typeof email !== "string" ||
                !emailRegex.test(email.trim())
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid email address."
                });
            }

            const normalizedEmail = email.trim().toLowerCase();

            const existingUser = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: req.user._id }
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "This email is already in use."
                });
            }

            updates.email = normalizedEmail;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide a name or email to update."
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This email is already in use."
            });
        }

        next(error);
    }
};

// Change logged-in user's password
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (
            typeof currentPassword !== "string" ||
            !currentPassword ||
            typeof newPassword !== "string" ||
            !newPassword
        ) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required."
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must contain at least 8 characters."
            });
        }

        const user = await User.findById(req.user._id)
            .select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const isPasswordCorrect = await user.comparePassword(
            currentPassword
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect."
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password."
            });
        }

        // The User model's pre-save hook hashes the new password
        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully."
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    changePassword
};
