const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  departureTime: { type: String, required: true },
  driverName: { type: String, default: 'Not Assigned' },
  conductorName: { type: String, default: 'Not Assigned' }
});

const Bus = mongoose.model('Bus', busSchema);
module.exports = Bus;