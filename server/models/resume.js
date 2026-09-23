const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        originalName: {
            type: String,
            required: true,
            trim: true
        },

        s3Key: {
            type: String,
            required: true,
            unique: true
        },

        contentType: {
            type: String,
            required: true,
            default: "application/pdf"
        },

        size: {
            type: Number,
            required: true
        },

        status: {
            type: String,

            enum: [
                "PENDING",
                "UPLOADED",
                "PROCESSING",
                "READY",
                "FAILED"
            ],

            default: "PENDING",

            index: true
        },

        failureReason: {
            type: String,
            default: null
        },

        extractedText: {
            type: String,
            default: null
        },

        skills: {
            type: [String],
            default: []
        }
    },

    {
        timestamps: true
    }
);

module.exports =
    mongoose.model("Resume", resumeSchema);