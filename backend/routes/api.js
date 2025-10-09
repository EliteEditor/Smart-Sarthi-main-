const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');
const Route = require('../models/Route');

// --- Bus Finder Endpoint (for public-facing journey planner) ---
router.post('/findBus', async (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) {
      return res.status(400).json({ message: 'Origin (from) and destination (to) are required.' });
    }
    const route = await Route.findOne({
      from: new RegExp(`^${from}$`, 'i'),
      to: new RegExp(`^${to}$`, 'i')
    });
    if (!route) {
      return res.json({ results: [] });
    }
    const buses = await Bus.find({ route: route._id }).populate('route');
    const formattedResults = buses.map(bus => ({
        bus: bus.busNumber,
        from: bus.route.from,
        to: bus.route.to,
        time: bus.departureTime
    }));
    res.json({ results: formattedResults });
  } catch (error) {
    console.error('Error in /findBus route:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});


// --- Admin Panel: Route Management CRUD Endpoints ---
router.get('/routes', async (req, res) => {
    try {
        const routes = await Route.find({});
        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching routes.' });
    }
});
router.get('/routes/:id', async (req, res) => {
    try {
        const route = await Route.findById(req.params.id);
        if (!route) {
            return res.status(404).json({ message: 'Route not found.' });
        }
        res.json(route);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching single route.' });
    }
});
router.post('/routes', async (req, res) => {
    try {
        const newRoute = new Route(req.body);
        await newRoute.save();
        res.status(201).json(newRoute);
    } catch (error) {
        res.status(400).json({ message: 'Error creating route.', error });
    }
});
router.put('/routes/:id', async (req, res) => {
    try {
        const updatedRoute = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedRoute) {
            return res.status(404).json({ message: 'Route not found.' });
        }
        res.json(updatedRoute);
    } catch (error) {
        res.status(400).json({ message: 'Error updating route.', error });
    }
});
router.delete('/routes/:id', async (req, res) => {
    try {
        const deletedRoute = await Route.findByIdAndDelete(req.params.id);
        if (!deletedRoute) {
            return res.status(404).json({ message: 'Route not found.' });
        }
        res.json({ message: 'Route deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting route.', error });
    }
});


// --- NEW: Admin Bus Management Endpoints ---

// GET /api/buses - Fetch all buses
router.get('/buses', async (req, res) => {
    try {
        // .populate('route') replaces the route ID with the full route document
        const buses = await Bus.find({}).populate('route');
        res.json(buses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching buses.' });
    }
});

// POST /api/buses - Create a new bus
router.post('/buses', async (req, res) => {
    try {
        const newBus = new Bus(req.body);
        await newBus.save();
        res.status(201).json(newBus);
    } catch (error) {
        res.status(400).json({ message: 'Error creating bus.', error });
    }
});

// PUT /api/buses/:id - Update a bus
router.put('/buses/:id', async (req, res) => {
    try {
        const updatedBus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedBus) return res.status(404).json({ message: 'Bus not found.' });
        res.json(updatedBus);
    } catch (error) {
        res.status(400).json({ message: 'Error updating bus.', error });
    }
});

// DELETE /api/buses/:id - Delete a bus
router.delete('/buses/:id', async (req, res) => {
    try {
        const deletedBus = await Bus.findByIdAndDelete(req.params.id);
        if (!deletedBus) return res.status(404).json({ message: 'Bus not found.' });
        res.json({ message: 'Bus deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting bus.', error });
    }
});


module.exports = router;