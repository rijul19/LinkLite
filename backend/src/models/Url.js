
const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
    {
        originalUrl: {
            type: String,
            required: [true, "Original URL is required"],
            trim: true,
            validate: {
                validator: function (value) {
                    try {
                        const parsedUrl = new URL(value);
                        return ["http:", "https:"].includes(parsedUrl.protocol);
                    } catch {
                        return false;
                    }
                },
                message: "Please provide a valid HTTP or HTTPS URL"
            }
        },

        shortCode: {
            type: String,
            required: [true, "Short code is required"],
            unique: true,
            trim: true,
            minlength: [7, "Short code must be 7 characters"],
            maxlength: [7, "Short code must be 7 characters"]
        },

        clicks: {
            type: Number,
            default: 0,
            min: [0, "Clicks cannot be negative"],
            validate: {
                validator: Number.isInteger,
                message: "Clicks must be a whole number"
            }
        },

        // Optional expiration date for the short URL
        expiresAt: {
            type: Date,
            default: null,
            validate: {
                validator: function (value) {
                    return value === null || value > new Date();
                },
                message: "Expiration date must be in the future"
            }
        },

        // null means the URL was created by a guest
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Efficient user URL queries
urlSchema.index({ user: 1, createdAt: -1 });

// Find URLs by short code and expiration status
urlSchema.index({ shortCode: 1, expiresAt: 1 });

// Virtual: Generate short URL
urlSchema.virtual("shortUrl").get(function () {
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    return `${baseUrl}/${this.shortCode}`;
});

// Virtual: Check whether URL has expired
urlSchema.virtual("isExpired").get(function () {
    return this.expiresAt !== null &&
        this.expiresAt !== undefined &&
        this.expiresAt <= new Date();
});

module.exports = mongoose.model("Url", urlSchema);
