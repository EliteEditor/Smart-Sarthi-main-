const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        default: 'User'
    }
}, { timestamps: true }); // Enable timestamps (createdAt and updatedAt)

const User = mongoose.model('User', userSchema);

module.exports = User;