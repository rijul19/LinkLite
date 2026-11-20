
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

        // Optional relationship with User model
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

// Compound index for efficient user URL queries
urlSchema.index({ user: 1, createdAt: -1 });

// Virtual: Generate short URL
urlSchema.virtual("shortUrl").get(function () {
    return `${process.env.BASE_URL}/${this.shortCode}`;
});

module.exports = mongoose.model("Url", urlSchema);
