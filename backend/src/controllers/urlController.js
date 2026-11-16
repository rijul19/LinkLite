
const urlService = require("../services/urlService");

const createUrl = (req, res) => {
    try {
        const { originalUrl } = req.body;

        if (!originalUrl || typeof originalUrl !== "string") {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid URL"
            });
        }

        let parsedUrl;

        try {
            parsedUrl = new URL(originalUrl.trim());
        } catch {
            return res.status(400).json({
                success: false,
                message: "Invalid URL"
            });
        }

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            return res.status(400).json({
                success: false,
                message: "Only HTTP and HTTPS URLs are allowed"
            });
        }

        const urlData = urlService.createShortUrl(parsedUrl.href);

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
        console.error("Create URL error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getUrls = (req, res) => {
    res.status(200).json({
        success: true,
        data: urlService.getAllUrls()
    });
};

const updateUrl = (req, res) => {
    const { originalUrl } = req.body;

    if (!originalUrl || typeof originalUrl !== "string") {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid URL"
        });
    }

    let parsedUrl;

    try {
        parsedUrl = new URL(originalUrl.trim());
    } catch {
        return res.status(400).json({
            success: false,
            message: "Invalid URL"
        });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return res.status(400).json({
            success: false,
            message: "Only HTTP and HTTPS URLs are allowed"
        });
    }

    const updated = urlService.updateUrl(
        req.params.code,
        parsedUrl.href
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
};

const deleteUrl = (req, res) => {
    const deleted = urlService.deleteUrl(req.params.code);

    if (!deleted) {
        return res.status(404).json({
            success: false,
            message: "Short URL not found"
        });
    }

    res.status(200).json({
        success: true,
        message: "URL deleted successfully"
    });
};

const redirectUrl = (req, res) => {
    const urlData = urlService.getUrlByCode(req.params.code);

    if (!urlData) {
        return res.status(404).send("Short URL not found");
    }

    urlData.clicks++;

    res.redirect(302, urlData.originalUrl);
};

module.exports = {
    createUrl,
    getUrls,
    updateUrl,
    deleteUrl,
    redirectUrl
};
