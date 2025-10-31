const mongoose = require('mongoose');

const busTypeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Ordinary Bus", "Shivshahi (AC)"
  ratePerKm: { type: Number, required: true } // e.g., 1.0, 1.6
});

module.exports = mongoose.model('BusType', busTypeSchema);
