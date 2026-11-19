
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
const { optionalAuth, protect } = require("../middleware/authMiddleware");

const {
    urlSchema,
    paginationSchema
} = require("../validation/urlValidation");

// Create a short URL (guests and logged-in users)
router.post(
    "/",
    createUrlLimiter,
    optionalAuth,
    validateRequest(urlSchema),
    createUrl
);

// Get only the logged-in user's URLs
router.get(
    "/",
    protect,
    validateRequest(paginationSchema, "query"),
    getUrls
);

router.get("/:code/stats", protect, getUrlStats);

router.put(
    "/:code",
    protect,
    validateRequest(urlSchema),
    updateUrl
);

router.delete("/:code", protect, deleteUrl);

module.exports = router;
