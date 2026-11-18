
const crypto = require("crypto");
const Url = require("../models/Url");

// Generate a unique short code
const generateShortCode = () => {
    return crypto.randomBytes(5).toString("hex").slice(0, 7);
};

// Create a new short URL
const createShortUrl = async (originalUrl) => {
    let shortCode;
    let existingUrl;

    do {
        shortCode = generateShortCode();
        existingUrl = await Url.findOne({ shortCode });
    } while (existingUrl);

    const newUrl = await Url.create({
        originalUrl,
        shortCode
    });

    return newUrl.toObject();
};

// Get all saved URLs with pagination
const getAllUrls = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [urls, totalUrls] = await Promise.all([
        Url.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Url.countDocuments()
    ]);

    return {
        urls,
        pagination: {
            currentPage: page,
            limit,
            totalUrls,
            totalPages: Math.ceil(totalUrls / limit)
        }
    };
};

// Get URL using short code
const getUrlByCode = async (code) => {
    return await Url.findOne({ shortCode: code }).lean();
};

// Update original URL
const updateUrl = async (code, originalUrl) => {
    return await Url.findOneAndUpdate(
        { shortCode: code },
        { originalUrl },
        {
            new: true,
            runValidators: true
        }
    ).lean();
};

// Delete URL
const deleteUrl = async (code) => {
    return await Url.findOneAndDelete({ shortCode: code });
};
// Get statistics for a short URL
const getUrlStats = async (code) => {
    const url = await Url.findOne({ shortCode: code }).lean();

    if (!url) {
        return null;
    }

    return {
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        totalClicks: url.clicks,
        createdAt: url.createdAt
    };
};
module.exports = {
    createShortUrl,
    getAllUrls,
    getUrlByCode,
    updateUrl,
    deleteUrl,
    getUrlStats
};
