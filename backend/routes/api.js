const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Import all necessary models at the top
const Bus = require('../models/Bus');
const Route = require('../models/Route'); // FIX WAS HERE
const Pass = require('../models/Pass');
const UsageRecord = require('../models/UsageRecord');

// --- PUBLIC BUS FINDER ENDPOINT ---
router.post('/findBus', async (req, res) => {
    try {
        const { from, to } = req.body;
        const route = await Route.findOne({ from: new RegExp(`^${from}$`, 'i'), to: new RegExp(`^${to}$`, 'i') });
        if (!route) return res.json({ results: [] });
        const buses = await Bus.find({ route: route._id }).populate('route');
        const results = buses.map(bus => ({ bus: bus.busNumber, from: bus.route.from, to: bus.route.to, time: bus.departureTime }));
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// --- ADMIN: ROUTE MANAGEMENT ---
router.get('/routes', async (req, res) => {
    try {
        const routes = await Route.find();
        res.json(routes);
    }
    catch (err) { res.status(500).json({ message: err.message }); }
});
// ... (the rest of your routes for post, put, delete routes/buses)
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


// --- ADMIN: USER MANAGEMENT ---
router.get('/users', async (req, res) => {
    try {
        const listUsersResult = await admin.auth().listUsers();
        const enrichedUsers = await Promise.all(
            listUsersResult.users.map(async (userRecord) => {
                const pass = await Pass.findOne({ userId: userRecord.uid, status: 'active' });
                return {
                    uid: userRecord.uid,
                    email: userRecord.email,
                    displayName: userRecord.displayName || 'N/A',
                    passStatus: pass ? 'active' : 'deactivated',
                    passExpiry: pass ? pass.expiryDate : 'N/A',
                };
            })
        );
        res.json(enrichedUsers);
    } catch (error) { 
        console.error('Error listing users:', error);
        res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
});
// ... (the rest of your user management routes)
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

// --- USER-FACING: PASS MANAGEMENT ---
// ... (your my-pass, purchase, and delete pass routes)
router.get('/passes/my-pass/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const pass = await Pass.findOne({ userId: uid, status: 'active' });
        if (!pass) {
            return res.status(404).json({ message: 'No active pass found for this user.' });
        }
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const usageRecords = await UsageRecord.find({ passId: pass._id, date: { $gte: startOfMonth, $lte: endOfMonth } });
        const usedDays = new Set(usageRecords.map(record => record.date.getDate()));
        const daysInMonth = endOfMonth.getDate();
        const calendarDays = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(today.getFullYear(), today.getMonth(), i);
            let usedStatus = null;
            if (dayDate <= today) {
                usedStatus = usedDays.has(i);
            }
            calendarDays.push({ day: i, used: usedStatus });
        }
        res.json({ passDetails: pass, calendarDays: calendarDays });
    } catch (error) {
        console.error('Error fetching user pass:', error);
        res.status(500).json({ message: 'Server error while fetching pass data.' });
    }
});
router.post('/passes/purchase', async (req, res) => {
    const { userId, routeId, passType, startDate } = req.body;
    if (!userId || !routeId || !passType || !startDate) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
        const existingPass = await Pass.findOne({ userId: userId, status: 'active' });
        if (existingPass) {
            return res.status(409).json({ message: 'You already have an active pass.' });
        }
        const route = await Route.findById(routeId);
        if (!route) {
            return res.status(404).json({ message: 'Selected route not found.' });
        }
        const passStartDate = new Date(startDate);
        const expiryDate = new Date(passStartDate);
        if (passType === 'monthly') {
            expiryDate.setDate(passStartDate.getDate() + 30);
        } else if (passType === 'quarterly') {
            expiryDate.setDate(passStartDate.getDate() + 90);
        } else {
            return res.status(400).json({ message: 'Invalid pass type.' });
        }
        const newPass = new Pass({
            userId: userId,
            passCode: `SS-${passType.slice(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
            passType: passType,
            startDate: passStartDate,
            expiryDate: expiryDate,
            status: 'active',
            fromLocation: route.from,
            toLocation: route.to,
        });
        await newPass.save();
        res.status(201).json({ message: 'Pass purchased successfully!', pass: newPass });
    } catch (error) {
        console.error('Error purchasing pass:', error);
        res.status(500).json({ message: 'Server error during pass purchase.' });
    }
});
router.delete('/passes/delete/:passId', async (req, res) => {
    try {
        const { passId } = req.params;
        const deletedPass = await Pass.findByIdAndDelete(passId);
        if (!deletedPass) {
            return res.status(404).json({ message: 'Pass not found.' });
        }
        await UsageRecord.deleteMany({ passId: passId });
        res.json({ message: 'Pass deleted successfully.' });
    } catch (error) {
        console.error('Error deleting pass:', error);
        res.status(500).json({ message: 'Server error during pass deletion.' });
    }
});

module.exports = router;

