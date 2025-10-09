// backend/models/Pass.js

const mongoose = require('mongoose');

const passSchema = new mongoose.Schema({
    // We'll use the Firebase UID to link the pass to a user
    userId: {
        type: String,
        required: true,
    },
    passCode: {
        type: String,
        required: true,
        unique: true,
    },
    passType: {
        type: String,
        required: true,
        enum: ['monthly', 'quarterly'], // Can only be one of these values
    },
    startDate: {
        type: Date,
        required: true,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'expired', 'inactive'],
        default: 'active',
    },
    fromLocation: {
        type: String,
        required: true,
    },
    toLocation: {
        type: String,
        required: true,
    },
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

module.exports = mongoose.model('Pass', passSchema);