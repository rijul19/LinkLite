
const crypto = require("crypto");
const Url = require("../models/Url");
const User = require("../models/User");

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

// Get URLs using Mongoose virtual populate
const getUserUrlsWithDetails = async (userId) => {
    const user = await User.findById(userId)
        .select("name email")
        .populate({
            path: "urls",
            select: "originalUrl shortCode clicks createdAt",
            options: {
                sort: { createdAt: -1 }
            }
        });

    if (!user) {
        return null;
    }

    return user;
};

// Get URL usage summary using MongoDB aggregation
const getUserUrlSummary = async (userId) => {
    const summary = await Url.aggregate([
        {
            $match: {
                user: userId
            }
        },
        {
            $group: {
                _id: null,
                totalUrls: { $sum: 1 },
                totalClicks: { $sum: "$clicks" },
                averageClicks: { $avg: "$clicks" }
            }
        },
        {
            $project: {
                _id: 0,
                totalUrls: 1,
                totalClicks: 1,
                averageClicks: {
                    $round: ["$averageClicks", 2]
                }
            }
        }
    ]);

    return summary[0] || {
        totalUrls: 0,
        totalClicks: 0,
        averageClicks: 0
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
    getUserUrlsWithDetails,
    getUserUrlSummary,
    getUrlByCode,
     updateUrl,
    deleteUrl,
    getUrlStats
};
