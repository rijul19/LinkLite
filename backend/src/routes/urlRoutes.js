
const express = require("express");
const router = express.Router();

const {
    createUrl,
    getUrls,
    updateUrl,
    deleteUrl
} = require("../controllers/urlController");

// Create a short URL
router.post("/", createUrl);

// Get all URLs
router.get("/", getUrls);

// Update an existing URL
router.put("/:code", updateUrl);

// Delete a URL
router.delete("/:code", deleteUrl);

module.exports = router;
