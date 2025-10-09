const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');
const Route = require('../models/Route'); 
const admin = require('firebase-admin');

// --- Bus Finder Endpoint ---
router.post('/findBus', async (req, res) => {
  try {
    const { from, to } = req.body;
    const route = await Route.findOne({ from: new RegExp(`^${from}$`, 'i'), to: new RegExp(`^${to}$`, 'i') });
    if (!route) return res.json({ results: [] });
    const buses = await Bus.find({ route: route._id }).populate('route');
    const results = buses.map(bus => ({ bus: bus.busNumber, from: bus.route.from, to: bus.route.to, time: bus.departureTime }));
    res.json({ results });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// --- Routes for Route Management ---
router.get('/routes', async (req, res) => {
  try { const routes = await Route.find(); res.json(routes); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/routes', async (req, res) => {
  const route = new Route(req.body);
  try { const newRoute = await route.save(); res.status(201).json(newRoute); }
  catch (err) { res.status(400).json({ message: err.message }); }
});
router.put('/routes/:id', async (req, res) => {
  try { const updatedRoute = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(updatedRoute); }
  catch (err) { res.status(400).json({ message: err.message }); }
});
router.delete('/routes/:id', async (req, res) => {
  try { await Route.findByIdAndDelete(req.params.id); res.json({ message: 'Route deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

// --- Routes for Bus Management ---
router.get('/buses', async (req, res) => {
  try { const buses = await Bus.find().populate('route'); res.json(buses); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/buses', async (req, res) => {
  const bus = new Bus(req.body);
  try { const newBus = await bus.save(); res.status(201).json(newBus); }
  catch (err) { res.status(400).json({ message: err.message }); }
});
router.put('/buses/:id', async (req, res) => {
  try { const updatedBus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(updatedBus); }
  catch (err) { res.status(400).json({ message: err.message }); }
});
router.delete('/buses/:id', async (req, res) => {
  try { await Bus.findByIdAndDelete(req.params.id); res.json({ message: 'Bus deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

// --- Route for Fetching Users ---
router.get('/users', async (req, res) => {
    try {
        const listUsersResult = await admin.auth().listUsers();
        const users = listUsersResult.users.map(userRecord => ({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName || userRecord.email,
            createdAt: new Date(userRecord.metadata.creationTime).toLocaleDateString(),
            lastSignInTime: new Date(userRecord.metadata.lastSignInTime).toLocaleDateString()
        }));
        res.json(users);
    } catch (error) { 
        console.error('Error listing users:', error);
        res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
});

// --- ADD THIS BLOCK FOR UPDATING AND DELETING USERS ---
// Route to UPDATE a user's details (e.g., displayName)
router.put('/users/:uid', async (req, res) => {
    const { uid } = req.params;
    const { displayName } = req.body;
    try {
        await admin.auth().updateUser(uid, { displayName });
        res.json({ message: 'User updated successfully.' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

// Route to DELETE a user
router.delete('/users/:uid', async (req, res) => {
    const { uid } = req.params;
    try {
        await admin.auth().deleteUser(uid);
        res.json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});
// ---------------------------------------------------------

module.exports = router;