const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  from: { type: String, required: true, trim: true },
  to: { type: String, required: true, trim: true },
  distance: { type: Number, required: true },
  duration: { type: String, required: true }
});

const Route = mongoose.model('Route', routeSchema);
module.exports = Route;