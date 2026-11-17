
const urlService = require("../services/urlService");

const validateUrl = (originalUrl) => {
    if (!originalUrl || typeof originalUrl !== "string") {
        return null;
    }

    try {
        const parsedUrl = new URL(originalUrl.trim());

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            return null;
        }

        return parsedUrl.href;
    } catch {
        return null;
    }
};

const createUrl = async (req, res, next) => {
    try {
        const validUrl = validateUrl(req.body.originalUrl);

        if (!validUrl) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid HTTP or HTTPS URL"
            });
        }

        const urlData = await urlService.createShortUrl(validUrl);

        const shortUrl = `${req.protocol}://${req.get("host")}/${urlData.shortCode}`;

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

const getUrls = async (req, res, next) => {
    try {
        const urls = await urlService.getAllUrls();

        return res.status(200).json({
            success: true,
            data: urls
        });
    } catch (error) {
        next(error);
    }
};

const updateUrl = async (req, res, next) => {
    try {
        const validUrl = validateUrl(req.body.originalUrl);

        if (!validUrl) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid HTTP or HTTPS URL"
            });
        }

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

const deleteUrl = async (req, res, next) => {
    try {
        const deleted = await urlService.deleteUrl(req.params.code);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Short URL not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "URL deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

const redirectUrl = async (req, res, next) => {
    try {
        const urlData = await urlService.getUrlByCode(req.params.code);

        if (!urlData) {
            return res.status(404).send("Short URL not found");
        }

        // Increment clicks atomically in MongoDB
        await require("../models/Url").updateOne(
            { shortCode: req.params.code },
            { $inc: { clicks: 1 } }
        );

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
    redirectUrl
};
