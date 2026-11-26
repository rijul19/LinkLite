
const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema(
    {
        url: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Url",
            required: true
        },
        shortCode: {
            type: String,
            required: true,
            trim: true
        },
        referrer: {
            type: String,
            default: "Direct",
            maxlength: 500
        },
        userAgent: {
            type: String,
            default: "Unknown",
            maxlength: 300
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

// Automatically remove click records after one year.
clickSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 31536000 }
);

// Improve URL-specific click history queries.
clickSchema.index({ url: 1, createdAt: -1 });

module.exports = mongoose.model("Click", clickSchema);
