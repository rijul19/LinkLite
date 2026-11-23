
const { Readable } = require("stream");
const { pipeline } = require("stream/promises");

const urlService = require("../services/urlService");
const Url = require("../models/Url");
const logger = require("../utils/logger");

// Create a new short URL (guest or logged-in user)
const createUrl = async (req, res, next) => {
    try {
        const validUrl = req.validatedBody.originalUrl;
        const expiresAt = req.validatedBody.expiresAt ?? null;
        const userId = req.user ? req.user._id : null;

        const urlData = await urlService.createShortUrl(
            validUrl,
            userId,
            expiresAt
        );

        const shortUrl =
            `${req.protocol}://${req.get("host")}/${urlData.shortCode}`;

        logger.info(
            `Short URL created: ${urlData.shortCode} -> ${validUrl}`
        );

        return res.status(201).json({
            success: true,
            message: "Short URL created successfully",
            data: {
                ...urlData.toObject(),
                shortUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get logged-in user's URLs with pagination
const getUrls = async (req, res, next) => {
    try {
        const { page, limit } = req.validatedQuery;

        const result = await urlService.getAllUrls(
            req.user._id,
            page,
            limit
        );

        return res.status(200).json({
            success: true,
            data: result.urls,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get logged-in user's URLs using Mongoose virtual populate
const getMyUrlDetails = async (req, res, next) => {
    try {
        const user = await urlService.getUserUrlsWithDetails(
            req.user._id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// Get logged-in user's URL summary
const getUrlSummary = async (req, res, next) => {
    try {
        const summary = await urlService.getUserUrlSummary(
            req.user._id
        );

        return res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        next(error);
    }
};

// Get statistics for the logged-in user's URL
const getUrlStats = async (req, res, next) => {
    try {
        const stats = await urlService.getUrlStats(
            req.params.code,
            req.user._id
        );

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

// Get click history and analytics for a user's URL
const getUrlClicks = async (req, res, next) => {
    try {
        const days = Number(
            req.validatedQuery?.days ?? req.query.days ?? 30
        );

        if (!Number.isInteger(days) || days < 1 || days > 90) {
            return res.status(400).json({
                success: false,
                message: "Days must be between 1 and 90"
            });
        }

        const analytics = await urlService.getUrlClickAnalytics(
            req.params.code,
            req.user._id,
            days
        );

        if (!analytics) {
            return res.status(404).json({
                success: false,
                message: "Short URL not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        next(error);
    }
};

// Update an existing URL owned by the logged-in user
const updateUrl = async (req, res, next) => {
    try {
        const validUrl = req.validatedBody.originalUrl;
        const expiresAt = req.validatedBody.expiresAt;

        const updated = await urlService.updateUrl(
            req.params.code,
            validUrl,
            req.user._id,
            expiresAt
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Short URL not found"
            });
        }

        const shortUrl =
            `${req.protocol}://${req.get("host")}/${updated.shortCode}`;

        logger.info(`URL updated: ${updated.shortCode}`);

        return res.status(200).json({
            success: true,
            message: "URL updated successfully",
            data: {
                ...updated.toObject(),
                shortUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

// Delete an existing URL owned by the logged-in user
const deleteUrl = async (req, res, next) => {
    try {
        const deleted = await urlService.deleteUrl(
            req.params.code,
            req.user._id
        );

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

// Export the logged-in user's URLs as a CSV file
const exportUserUrls = async (req, res, next) => {
    const cursor = urlService.getUserUrlsCursor(req.user._id);

    const escapeCsv = (value) => {
        let text = String(value ?? "");

        // Prevent spreadsheet formula injection
        if (/^[=+\-@\t\r]/.test(text)) {
            text = "'" + text;
        }

        return `"${text.replace(/"/g, '""')}"`;
    };

    try {
        res.setHeader("Content-Type", "text/csv; charset=utf-8");

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="linklite-urls.csv"'
        );

        const csvStream = Readable.from(
            (async function* () {
                yield Buffer.from(
                    "Original URL,Short Code,Clicks,Created At\n",
                    "utf8"
                );

                for await (const url of cursor) {
                    const row = [
                        url.originalUrl,
                        url.shortCode,
                        url.clicks,
                        url.createdAt
                            ? new Date(url.createdAt).toISOString()
                            : ""
                    ].map(escapeCsv).join(",") + "\n";

                    yield Buffer.from(row, "utf8");
                }
            })()
        );

        await pipeline(csvStream, res);
    } catch (error) {
        if (typeof cursor.close === "function") {
            await cursor.close().catch(() => {});
        }

        if (res.headersSent) {
            logger.error(
                `URL CSV export failed: ${error.message}`
            );
            return;
        }

        next(error);
    }
};

// Redirect short URL to original URL (public)
const redirectUrl = async (req, res, next) => {
    try {
        const urlData = await urlService.getUrlByCode(
            req.params.code
        );

        if (!urlData) {
            return res.status(404).send("Short URL not found");
        }

        // Stop redirects for expired URLs
        if (
            urlData.expiresAt &&
            urlData.expiresAt <= new Date()
        ) {
            return res.status(410).json({
                success: false,
                message: "This short URL has expired"
            });
        }

        // Increment total click count
        await Url.updateOne(
            { _id: urlData._id },
            { $inc: { clicks: 1 } }
        );

        // Save individual click details
        urlService.recordClick(urlData, req).catch(error => {
            logger.error(
                `Click recording failed: ${error.message}`
            );
        });

        logger.info(`URL redirected: ${req.params.code}`);

        return res.redirect(302, urlData.originalUrl);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createUrl,
    getUrls,
    getMyUrlDetails,
    getUrlSummary,
    getUrlStats,
    getUrlClicks,
    updateUrl,
    deleteUrl,
    exportUserUrls,
    redirectUrl
};
