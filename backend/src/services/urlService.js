
const crypto = require("crypto");
const mongoose = require("mongoose");

const Url = require("../models/Url");
const User = require("../models/User");
const Click = require("../models/Click");

// Create a shortened URL
const createShortUrl = async (originalUrl, userId = null) => {
    const shortCode = crypto.randomBytes(4).toString("hex").slice(0, 7);

    const urlData = await Url.create({
        originalUrl,
        shortCode,
        user: userId || undefined
    });

    return urlData;
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

// Get user details along with their URLs using virtual populate
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
const updateUrl = async (shortCode, originalUrl, userId) => {
    return Url.findOneAndUpdate(
        {
            shortCode,
            user: userId
        },
        {
            originalUrl
        },
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

    return Click.create({
        url: urlData._id,
        shortCode: urlData.shortCode,
        referrer: referrer.slice(0, 500),
        userAgent: userAgent.slice(0, 300)
    });
};

// Get daily click analytics and top referrers
const getUrlClickAnalytics = async (shortCode, userId, days = 30) => {
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

    // Fill dates with zero clicks when no clicks occurred
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
