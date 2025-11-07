const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken'); // 1. IMPORT JWT

// Import all necessary models at the top
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Pass = require('../models/Pass');
const UsageRecord = require('../models/UsageRecord');
const BusType = require('../models/BusType');
const PassengerCategory = require('../models/PassengerCategory');

// --- 1. ENDPOINT FOR DROPDOWNS (cal.js calls /data) ---
router.get('/data', async (req, res) => {
    try {
        const busTypes = await BusType.find();
        const passengerCategories = await PassengerCategory.find();
        
        // Get unique 'from' locations from your Routes
        const locations = await Route.distinct('from');

        res.json({
            busTypes: busTypes.map(bt => ({ id: bt._id, name: bt.name })),
            passengerCategories: passengerCategories.map(pc => ({ id: pc._id, name: pc.name })),
            locations: locations
        });
    } catch (error) {
        console.error("Error fetching fare data:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// --- 2. ENDPOINT FOR DISTANCE (cal.js calls /distance) ---
router.get('/distance', async (req, res) => {
    try {
        const { from, to } = req.query;
        const route = await Route.findOne({ from, to });

        if (!route) {
            return res.json({ distance: null });
        }
        const distance = parseInt(route.distance);
        
        res.json({ distance: distance });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// --- 3. ENDPOINT FOR CALCULATION (cal.js calls /calculate) ---
router.post('/calculate', async (req, res) => {
    try {
        const { from, to, busTypeId, passengerId } = req.body;

        const route = await Route.findOne({ from, to });
        const busType = await BusType.findById(busTypeId);
        const category = await PassengerCategory.findById(passengerId);

        if (!route || !busType || !category) {
            return res.status(404).json({ message: "Data not found. Please check selections." });
        }

        const distance = parseInt(route.distance);
        if (isNaN(distance)) {
            return res.status(500).json({ message: "Route distance is invalid." });
        }

        const baseFare = distance * busType.ratePerKm;
        const discountApplied = baseFare * (category.discountPercent / 100);
        const finalFare = baseFare - discountApplied;

        res.json({
            distance: distance,
            busType: busType.name,
            passengerType: category.name,
            baseFare: baseFare,
            discountApplied: discountApplied,
            finalFare: finalFare,
            discountMessage: `${category.name} (${category.discountPercent}% discount)`
        });

    } catch (error) {
        console.error("Calculation Error:", error);
        res.status(500).json({ message: "Calculation error" });
    }
});

// --- 4. ENDPOINT FOR DYNAMIC DESTINATIONS ---
router.get('/destinations', async (req, res) => {
    try {
        const { from } = req.query;
        if (!from) {
            return res.status(400).json({ message: "A 'from' location is required." });
        }
        const destinations = await Route.distinct('to', { from: from });
        res.json(destinations);
    } catch (error) {
        console.error("Error fetching destinations:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// --- 5. NEW: CHECK-IN ENDPOINT (For Conductor Scanner) ---
// This new endpoint replaces the old /passes/usage route
router.post('/check-in', async (req, res) => {
    console.log("🔹 [1] Request received at /check-in");
    const { qrToken } = req.body;

    if (!qrToken) {
        console.log("❌ [Error] No QR token provided");
        return res.status(400).json({ message: 'QR Token is required.' });
    }

    try {
        console.log("🔹 [2] Verifying JWT...");
        const decoded = jwt.verify(qrToken, process.env.JWT_SECRET);
        const { passId } = decoded;
        console.log("✅ [3] JWT Verified. Pass ID:", passId);

        console.log("🔹 [4] Connecting to DB to find Pass...");
        // --- IT LIKELY FREEZES HERE ---
        const pass = await Pass.findById(passId);
        console.log("✅ [5] DB responded. Pass found:", !!pass);

        if (!pass || pass.status !== 'active') {
            console.log("❌ [Error] Pass is invalid or inactive");
            return res.status(404).json({ message: 'Pass is not valid or expired.' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log("🔹 [6] Checking if already used today...");
        const existingRecord = await UsageRecord.findOne({ passId: pass._id, date: today });

        if (existingRecord) {
             console.log("⚠️ [Warning] Pass already used today");
            return res.status(409).json({ message: 'Pass already used for today.' });
        }

        console.log("🔹 [7] Creating new usage record...");
        await new UsageRecord({ passId: pass._id, date: today, used: true }).save();
        console.log("✅ [8] Usage record saved successfully!");

        res.status(201).json({ 
            message: `Check-in successful!`,
            route: `${pass.fromLocation} to ${pass.toLocation}`
        });
        console.log("🚀 [9] Response sent to client.");

    } catch (error) {
        console.error('❌ [CRITICAL ERROR]:', error.message);
        res.status(401).json({ message: 'Invalid or Expired QR Code.' });
    }
});


// --- PUBLIC BUS FINDER ENDPOINT ---
router.post('/findBus', async (req, res) => {
    try {
        const { from, to } = req.body;
        const route = await Route.findOne({
            from: new RegExp(`^${from}$`, 'i'),
            to: new RegExp(`^${to}$`, 'i')
        });

        if (!route) {
            return res.json({ results: [], routeDetails: null });
        }

        const buses = await Bus.find({ route: route._id });
        const results = buses.map(bus => ({
            bus: bus.busNumber,
            time: bus.departureTime
        }));

        res.json({ results: results, routeDetails: route });

    } catch (error) {
        console.error("Error in /findBus route:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- ADMIN: ROUTE MANAGEMENT ---
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

// --- ADMIN: BUS MANAGEMENT ---
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

// --- ADMIN: USER MANAGEMENT (Combines User & Pass Info) ---
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
                    passType: pass ? pass.passType : 'N/A'
                };
            })
        );
        res.json(enrichedUsers);
    } catch (error) {
        console.error('Error listing users:', error);
        res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
});
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

// --- ADMIN: USER PASS HISTORY ---
router.get('/passes/my-pass/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const pass = await Pass.findOne({ userId: uid, status: 'active' });
        if (!pass) {
            return res.status(404).json({ message: 'No active pass found for this user.' });
        }
        
        // --- CHANGE THIS SECTION ---
        // Old code (caused the bug):
        // const usageRecords = await UsageRecord.find({
        //     passId: pass._id,
        //     date: { $gte: pass.startDate, $lte: pass.expiryDate }
        // });

        // New code (Fixes the bug by ignoring time differences):
        const usageRecords = await UsageRecord.find({ passId: pass._id });
        // ---------------------------

        res.json({
            passDetails: pass,
            usageRecords: usageRecords
        });
    } catch (error) {
        console.error('Error fetching user pass:', error);
        res.status(500).json({ message: 'Server error while fetching pass data.' });
    }
});

// --- USER-FACING: PASS MANAGEMENT ---
router.get('/passes/my-pass/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const pass = await Pass.findOne({ userId: uid, status: 'active' });
        if (!pass) {
            return res.status(404).json({ message: 'No active pass found for this user.' });
        }
        const usageRecords = await UsageRecord.find({
            passId: pass._id,
            date: { $gte: pass.startDate, $lte: pass.expiryDate }
        });
        res.json({
            passDetails: pass,
            usageRecords: usageRecords
        });
    } catch (error) {
        console.error('Error fetching user pass:', error);
        res.status(500).json({ message: 'Server error while fetching pass data.' });
    }
});

// --- NEW: GET QR CODE TOKEN (Refreshes daily at midnight) ---
router.get('/passes/my-qr-token/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const pass = await Pass.findOne({ userId: uid, status: 'active' });

        if (!pass) {
            return res.status(404).json({ message: 'No active pass found.' });
        }

        // 1. Get the timestamp for "midnight today"
        // This ensures the token is identical every time you fetch it today.
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const iat = Math.floor(todayStart.getTime() / 1000); // "Issued At" time
        const exp = iat + (24 * 60 * 60); // Expires exactly 24 hours after midnight

        // 2. Create a stable token for the day
        const token = jwt.sign(
            { 
                passId: pass._id,
                iat: iat, // Force the issued time to midnight
                exp: exp  // Force expiry to next midnight
            }, 
            process.env.JWT_SECRET
        );

        // Send the token to the frontend to be rendered as a QR code
        res.json({ qrToken: token });

    } catch (error) {
        console.error('Error generating QR token:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/passes/purchase', async (req, res) => {
    const { userId, routeId, passType } = req.body;
    if (!userId || !routeId || !passType) {
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
        const passStartDate = new Date();
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
            passCode: `SS-${passType.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
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

// --- THIS ROUTE IS NOW OBSOLETE ---
// The new '/check-in' endpoint replaces it.
/*
router.post('/passes/usage', async (req, res) => {
    const { passId } = req.body;
    if (!passId) {
        return res.status(400).json({ message: 'Pass ID is required.' });
    }
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existingRecord = await UsageRecord.findOne({ passId: passId, date: today });
        if (existingRecord) {
            return res.status(409).json({ message: 'Already checked in for today.' });
        }
        await new UsageRecord({ passId: passId, date: today, used: true }).save();
        const updatedUsageRecords = await UsageRecord.find({ passId: passId });
        res.status(201).json({
            message: 'Check-in successful!',
            usageRecords: updatedUsageRecords
        });
    } catch (error) {
        console.error('Error logging pass usage:', error);
        res.status(500).json({ message: 'Server error during check-in.' });
    }
});
*/

module.exports = router;