
const express = require("express");
const router = express.Router();

const {
    register,
    login
} = require("../controllers/authController");

// Register a new account
router.post("/register", register);

// Login to an existing account
router.post("/login", login);

module.exports = router;
