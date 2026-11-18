
const express = require("express");
const router = express.Router();

const {
    createUrl,
    getUrls,
    updateUrl,
    deleteUrl,
    getUrlStats
} = require("../controllers/urlController");

const validateRequest = require("../middleware/validateRequest");
const { createUrlLimiter } = require("../middleware/rateLimitMiddleware");

const {
    urlSchema,
    paginationSchema
} = require("../validation/urlValidation");

// Create a short URL
router.post("/", createUrlLimiter, validateRequest(urlSchema), createUrl);

// Get all URLs with pagination
router.get("/", validateRequest(paginationSchema, "query"), getUrls);

// Get statistics for a short URL
router.get("/:code/stats", getUrlStats);

// Update an existing URL
router.put("/:code", validateRequest(urlSchema), updateUrl);

// Delete a URL
router.delete("/:code", deleteUrl);

module.exports = router;
