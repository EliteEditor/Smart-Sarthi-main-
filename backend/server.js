const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // This line loads your .env file

// --- FIREBASE ADMIN INITIALIZATION ---
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
// ------------------------------------

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// Make sure your .env file has a MONGO_URI variable
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// API Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Start the Server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  
  // --- THIS IS THE NEW DEBUGGING LINE ---
  // It will show us what value your server is seeing for JWT_SECRET
  console.log('Checking JWT_SECRET:', process.env.JWT_SECRET);
});
app.use(cors({
    origin: '*', // Allow ANY origin (great for local testing on different ports)
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));