
const urlService = require("../services/urlService");
const Url = require("../models/Url");
const logger = require("../utils/logger");

// Create a new short URL
const createUrl = async (req, res, next) => {
    try {
        const validUrl = req.validatedBody.originalUrl;

        const urlData = await urlService.createShortUrl(validUrl);

        const shortUrl = `${req.protocol}://${req.get("host")}/${urlData.shortCode}`;

        logger.info(
            `Short URL created: ${urlData.shortCode} -> ${validUrl}`
        );

        return res.status(201).json({
            success: true,
            message: "Short URL created successfully",
            data: {
                ...urlData,
                shortUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get all URLs with pagination
const getUrls = async (req, res, next) => {
    try {
        const { page, limit } = req.validatedQuery;

        const result = await urlService.getAllUrls(page, limit);

        return res.status(200).json({
            success: true,
            data: result.urls,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

// Get statistics for a short URL
const getUrlStats = async (req, res, next) => {
    try {
        const stats = await urlService.getUrlStats(req.params.code);

        if (!stats) {
            return res.status(404).json({
                success: false,
                message: "Short URL not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

// Update an existing URL
const updateUrl = async (req, res, next) => {
    try {
        const validUrl = req.validatedBody.originalUrl;

        const updated = await urlService.updateUrl(
            req.params.code,
            validUrl
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Short URL not found"
            });
        }

        const shortUrl = `${req.protocol}://${req.get("host")}/${updated.shortCode}`;

        logger.info(`URL updated: ${updated.shortCode}`);

        return res.status(200).json({
            success: true,
            message: "URL updated successfully",
            data: {
                ...updated,
                shortUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

// Delete an existing URL
const deleteUrl = async (req, res, next) => {
    try {
        const deleted = await urlService.deleteUrl(req.params.code);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Short URL not found"
            });
        }

        logger.info(`URL deleted: ${req.params.code}`);

        return res.status(200).json({
            success: true,
            message: "URL deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

// Redirect short URL to original URL
const redirectUrl = async (req, res, next) => {
    try {
        const urlData = await urlService.getUrlByCode(req.params.code);

        if (!urlData) {
            return res.status(404).send("Short URL not found");
        }

        // Increment clicks atomically in MongoDB
        await Url.updateOne(
            { shortCode: req.params.code },
            { $inc: { clicks: 1 } }
        );

        logger.info(`URL redirected: ${req.params.code}`);

        return res.redirect(302, urlData.originalUrl);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createUrl,
    getUrls,
    updateUrl,
    deleteUrl,
    redirectUrl,
    getUrlStats
};
