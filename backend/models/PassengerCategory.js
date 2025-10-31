const mongoose = require('mongoose');

const passengerCategorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Women", "Senior Citizens (75+)"
  discountPercent: { type: Number, required: true } // e.g., 50, 100
});

module.exports = mongoose.model('PassengerCategory', passengerCategorySchema);
