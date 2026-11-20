
const express = require("express");
const router = express.Router();

const {
    register,
    login,
    getMe,
    updateProfile,
    changePassword
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Public authentication routes
router.post("/register", register);
router.post("/login", login);

// Protected user routes
router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfile);
router.patch("/change-password", protect, changePassword);

module.exports = router;
