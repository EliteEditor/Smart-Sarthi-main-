// backend/models/UsageRecord.js

const mongoose = require('mongoose');

const usageRecordSchema = new mongoose.Schema({
    // This creates a direct link to a document in the 'Pass' collection
    passId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pass',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    used: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model('UsageRecord', usageRecordSchema);