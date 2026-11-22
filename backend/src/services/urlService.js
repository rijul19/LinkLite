
const crypto = require("crypto");
const mongoose = require("mongoose");

const Url = require("../models/Url");
const User = require("../models/User");
const Click = require("../models/Click");
const eventBus = require("../utils/eventBus");

// Create a shortened URL with collision handling
const createShortUrl = async (
    originalUrl,
    userId = null,
    expiresAt = null
) => {
    const maxAttempts = 5;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const shortCode = crypto
            .randomBytes(5)
            .toString("base64url")
            .slice(0, 7);

        try {
            const urlData = await Url.create({
                originalUrl,
                shortCode,
                user: userId || null,
                expiresAt: expiresAt || null
            });

            eventBus.emit("url:created", {
                shortCode: urlData.shortCode
            });

            return urlData;
        } catch (error) {
            const isDuplicateCode =
                error.code === 11000 &&
                (
                    error.keyPattern?.shortCode ||
                    error.keyValue?.shortCode
                );

            if (!isDuplicateCode || attempt === maxAttempts) {
                throw error;
            }
        }
    }

    throw new Error("Unable to generate a unique short code");
};

// Get logged-in user's URLs with pagination
const getAllUrls = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
        Url.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Url.countDocuments({ user: userId })
    ]);

    return {
        urls,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

// Get user details along with their URLs
const getUserUrlsWithDetails = async (userId) => {
    return User.findById(userId).populate({
        path: "urls",
        options: { sort: { createdAt: -1 } }
    });
};

// Get user URL summary using aggregation
const getUserUrlSummary = async (userId) => {
    const result = await Url.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalUrls: { $sum: 1 },
                totalClicks: { $sum: "$clicks" },
                averageClicks: { $avg: "$clicks" }
            }
        }
    ]);

    if (result.length === 0) {
        return {
            totalUrls: 0,
            totalClicks: 0,
            averageClicks: 0
        };
    }

    return {
        totalUrls: result[0].totalUrls,
        totalClicks: result[0].totalClicks,
        averageClicks: Number(
            (result[0].averageClicks || 0).toFixed(2)
        )
    };
};

// Find a URL using its short code
const getUrlByCode = async (shortCode) => {
    return Url.findOne({ shortCode });
};

// Update a URL belonging to a particular user
const updateUrl = async (
    shortCode,
    originalUrl,
    userId,
    expiresAt
) => {
    const updateData = { originalUrl };

    if (expiresAt !== undefined) {
        updateData.expiresAt = expiresAt || null;
    }

    return Url.findOneAndUpdate(
        {
            shortCode,
            user: userId
        },
        updateData,
        {
            new: true,
            runValidators: true
        }
    );
};

// Delete a URL belonging to a particular user
const deleteUrl = async (shortCode, userId) => {
    const url = await Url.findOneAndDelete({
        shortCode,
        user: userId
    });

    if (url) {
        await Click.deleteMany({ url: url._id });

        eventBus.emit("url:deleted", {
            shortCode: url.shortCode
        });
    }

    return url;
};

// Get basic statistics for a URL
const getUrlStats = async (shortCode, userId) => {
    return Url.findOne({
        shortCode,
        user: userId
    });
};

// Record an individual click
const recordClick = async (urlData, req) => {
    const referrer = req.get("referer") || "Direct";
    const userAgent = req.get("user-agent") || "Unknown";

    const click = await Click.create({
        url: urlData._id,
        shortCode: urlData.shortCode,
        referrer: referrer.slice(0, 500),
        userAgent: userAgent.slice(0, 300)
    });

    eventBus.emit("url:clicked", {
        shortCode: urlData.shortCode
    });

    return click;
};

// Get daily click analytics and top referrers
const getUrlClickAnalytics = async (
    shortCode,
    userId,
    days = 30
) => {
    const urlData = await Url.findOne({
        shortCode,
        user: userId
    });

    if (!urlData) {
        return null;
    }

    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));

    const [dailyResults, referrerResults, totalInRange] =
        await Promise.all([
            Click.aggregate([
                {
                    $match: {
                        url: urlData._id,
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt",
                                timezone: "UTC"
                            }
                        },
                        clicks: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),

            Click.aggregate([
                {
                    $match: {
                        url: urlData._id,
                        createdAt: { $gte: startDate },
                        referrer: {
                            $exists: true,
                            $nin: [null, ""]
                        }
                    }
                },
                {
                    $group: {
                        _id: "$referrer",
                        clicks: { $sum: 1 }
                    }
                },
                { $sort: { clicks: -1 } },
                { $limit: 5 }
            ]),

            Click.countDocuments({
                url: urlData._id,
                createdAt: { $gte: startDate }
            })
        ]);

    const daily = [];

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setUTCDate(startDate.getUTCDate() + i);

        const dateString = date.toISOString().slice(0, 10);

        const existingDay = dailyResults.find(
            (item) => item._id === dateString
        );

        daily.push({
            date: dateString,
            clicks: existingDay ? existingDay.clicks : 0
        });
    }

    const topReferrers = referrerResults.map((item) => ({
        referrer: item._id,
        clicks: item.clicks
    }));

    return {
        shortCode,
        days,
        totalInRange,
        daily,
        topReferrers
    };
};

// Get a cursor containing only the logged-in user's URLs
const getUserUrlsCursor = (userId) => {
    return Url.find({ user: userId })
        .select("originalUrl shortCode clicks createdAt")
        .sort({ createdAt: -1 })
        .lean()
        .cursor();
};

module.exports = {
    createShortUrl,
    getAllUrls,
    getUserUrlsWithDetails,
    getUserUrlSummary,
    getUrlByCode,
    updateUrl,
    deleteUrl,
    getUrlStats,
    recordClick,
    getUrlClickAnalytics,
    getUserUrlsCursor
};
