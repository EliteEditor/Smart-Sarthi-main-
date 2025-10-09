const mongoose = require('mongoose');
require('dotenv').config();

// Import the models
const Route = require('./models/Route');
const Bus = require('./models/Bus');

const sampleRoutes = [
    { from: "Nashik Road", to: "CBS", distance: "12 km", duration: "30 mins" },
    { from: "CBS", to: "Gangapur Road", distance: "8 km", duration: "25 mins" },
    { from: "Gangapur Road", to: "College Road", distance: "5 km", duration: "15 mins" }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Database connected for seeding.");

        // Clear existing data
        await Route.deleteMany({});
        await Bus.deleteMany({});
        console.log("🧹 Cleared existing routes and buses.");

        // Insert new routes and get their document IDs
        const createdRoutes = await Route.insertMany(sampleRoutes);
        console.log("🌱 Seeded sample routes.");

        const nashikToCbsRoute = createdRoutes.find(r => r.from === "Nashik Road" && r.to === "CBS");
        const cbsToGangapurRoute = createdRoutes.find(r => r.from === "CBS" && r.to === "Gangapur Road");
        const gangapurToCollegeRoute = createdRoutes.find(r => r.from === "Gangapur Road" && r.to === "College Road");


        // Create sample buses linked to the routes
        const sampleBuses = [
            { busNumber: "MH-15-AB-1234", route: nashikToCbsRoute._id, departureTime: "09:00 AM" },
            { busNumber: "MH-15-CD-5678", route: nashikToCbsRoute._id, departureTime: "09:30 AM" },
            { busNumber: "MH-15-EF-9012", route: cbsToGangapurRoute._id, departureTime: "10:00 AM" },
            { busNumber: "MH-15-GH-3456", route: gangapurToCollegeRoute._id, departureTime: "10:15 AM" }
        ];

        await Bus.insertMany(sampleBuses);
        console.log("🌱 Seeded sample buses.");
        
        console.log("✅ Database seeding complete!");

    } catch (error) {
        console.error("❌ Error seeding database:", error);
    } finally {
        // Close the connection
        mongoose.connection.close();
        console.log("🔌 Database connection closed.");
    }
};

seedDB();
