
const crypto = require("crypto");
const Url = require("../models/Url");

// Generate a unique short code
const generateShortCode = () => {
    return crypto.randomBytes(5).toString("hex").slice(0, 7);
};

// Create a new short URL
const createShortUrl = async (originalUrl, userId = null) => {
    let shortCode;
    let existingUrl;

    do {
        shortCode = generateShortCode();
        existingUrl = await Url.findOne({ shortCode });
    } while (existingUrl);

    const newUrl = await Url.create({
        originalUrl,
        shortCode,
        user: userId
    });

    return newUrl.toObject();
};

// Get a user's URLs with pagination
const getAllUrls = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const filter = { user: userId };

    const [urls, totalUrls] = await Promise.all([
        Url.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Url.countDocuments(filter)
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

// Get URL using short code (public redirect)
const getUrlByCode = async (code) => {
    return await Url.findOne({ shortCode: code }).lean();
};

// Update original URL belonging to a user
const updateUrl = async (code, originalUrl, userId) => {
    return await Url.findOneAndUpdate(
        {
            shortCode: code,
            user: userId
        },
        { originalUrl },
        {
            new: true,
            runValidators: true
        }
    ).lean();
};

// Delete URL belonging to a user
const deleteUrl = async (code, userId) => {
    return await Url.findOneAndDelete({
        shortCode: code,
        user: userId
    });
};

// Get statistics for a user's short URL
const getUrlStats = async (code, userId) => {
    const url = await Url.findOne({
        shortCode: code,
        user: userId
    }).lean();

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
