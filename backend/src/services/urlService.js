
const { nanoid } = require("nanoid");
const Url = require("../models/Url");

// Create a new short URL
const createShortUrl = async (originalUrl) => {
    const code = nanoid(7);

    const urlData = await Url.create({
        originalUrl,
        shortCode: code,
        clicks: 0
    });

    return urlData.toObject();
};

// Get all saved URLs
const getAllUrls = async () => {
    return await Url.find().sort({ createdAt: -1 }).lean();
};

// Find URL using short code
const getUrlByCode = async (code) => {
    return await Url.findOne({ shortCode: code }).lean();
};

// Delete URL
const deleteUrl = async (code) => {
    const deleted = await Url.findOneAndDelete({
        shortCode: code
    });

    return deleted;
};

// Update original URL
const updateUrl = async (code, newUrl) => {
    const updated = await Url.findOneAndUpdate(
        { shortCode: code },
        { originalUrl: newUrl },
        { new: true, runValidators: true }
    ).lean();

    return updated;
};

module.exports = {
    createShortUrl,
    getAllUrls,
    getUrlByCode,
    deleteUrl,
    updateUrl
};
