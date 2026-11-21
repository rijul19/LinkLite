const mongoose = require("mongoose");

// Clicks are stored in their own collection and reference the Url
// (referencing), instead of being embedded as an array inside the Url
// document. A popular link can get unlimited clicks, so an embedded array
// would keep growing towards MongoDB's 16 MB document limit.
const clickSchema = new mongoose.Schema(
    {
        url: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Url",
            required: true
        },

        shortCode: {
            type: String,
            required: true
        },

        referrer: {
            type: String,
            default: null
        },

        userAgent: {
            type: String,
            default: null
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

// "Clicks of one link within a date range"
clickSchema.index({ url: 1, createdAt: -1 });

// TTL: old click records are removed automatically after 1 year
clickSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

module.exports = mongoose.model("Click", clickSchema);