const { nanoid } = require("nanoid");

const urls = new Map();

const createShortUrl = (originalUrl) => {
    const code = nanoid(7);

    const urlData = {
        originalUrl,
        shortCode: code,
        clicks: 0,
        createdAt: new Date()
    };

    urls.set(code, urlData);

    return urlData;
};

const getAllUrls = () => {
    return Array.from(urls.values());
};

const getUrlByCode = (code) => {
    return urls.get(code);
};

const deleteUrl = (code) => {
    return urls.delete(code);
};
const updateUrl = (code, newUrl) => {
    const existingUrl = urls.get(code);

    if (!existingUrl) {
        return null;
    }

    existingUrl.originalUrl = newUrl;
    urls.set(code, existingUrl);

    return existingUrl;
};
module.exports = {
    createShortUrl,
    getAllUrls,
    getUrlByCode,
    deleteUrl,
    updateUrl
};