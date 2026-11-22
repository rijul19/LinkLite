
const express = require("express");
const router = express.Router();

const {
    createUrl,
    getUrls,
    updateUrl,
    deleteUrl,
    getUrlStats,
    getUrlClicks,
    getMyUrlDetails,
    getUrlSummary,
    exportUserUrls
} = require("../controllers/urlController");

const validateRequest = require("../middleware/validateRequest");
const { createUrlLimiter } = require("../middleware/rateLimitMiddleware");
const { optionalAuth, protect } = require("../middleware/authMiddleware");

const {
    urlSchema,
    paginationSchema,
    clicksQuerySchema
} = require("../validation/urlValidation");

// Create a short URL (guests and logged-in users)
router.post(
    "/",
    createUrlLimiter,
    optionalAuth,
    validateRequest(urlSchema),
    createUrl
);

// Export logged-in user's URLs as CSV
router.get("/export", protect, exportUserUrls);

// Database: virtual populate
router.get("/my-details", protect, getMyUrlDetails);

// Database: aggregation
router.get("/summary", protect, getUrlSummary);

// Get logged-in user's URLs with pagination
router.get(
    "/",
    protect,
    validateRequest(paginationSchema, "query"),
    getUrls
);

// Get statistics for a specific URL
router.get("/:code/stats", protect, getUrlStats);

// Get click history and analytics for a specific URL
router.get(
    "/:code/clicks",
    protect,
    validateRequest(clicksQuerySchema, "query"),
    getUrlClicks
);

// Update an existing URL
router.put(
    "/:code",
    protect,
    validateRequest(urlSchema),
    updateUrl
);

// Delete an existing URL
router.delete("/:code", protect, deleteUrl);

module.exports = router;
