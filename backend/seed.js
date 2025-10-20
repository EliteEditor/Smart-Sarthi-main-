// const mongoose = require('mongoose');
// require('dotenv').config();

// // Import the models
// const Route = require('./models/Route');
// const Bus = require('./models/Bus');

// const sampleRoutes = [
//     { from: "Nashik Road", to: "CBS", distance: "12 km", duration: "30 mins" },
//     { from: "CBS", to: "Gangapur Road", distance: "8 km", duration: "25 mins" },
//     { from: "Gangapur Road", to: "College Road", distance: "5 km", duration: "15 mins" }
// ];

// const seedDB = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI);
//         console.log("✅ Database connected for seeding.");

//         // Clear existing data
//         await Route.deleteMany({});
//         await Bus.deleteMany({});
//         console.log("🧹 Cleared existing routes and buses.");

//         // Insert new routes and get their document IDs
//         const createdRoutes = await Route.insertMany(sampleRoutes);
//         console.log("🌱 Seeded sample routes.");

//         const nashikToCbsRoute = createdRoutes.find(r => r.from === "Nashik Road" && r.to === "CBS");
//         const cbsToGangapurRoute = createdRoutes.find(r => r.from === "CBS" && r.to === "Gangapur Road");
//         const gangapurToCollegeRoute = createdRoutes.find(r => r.from === "Gangapur Road" && r.to === "College Road");


//         // Create sample buses linked to the routes
//         const sampleBuses = [
//             { busNumber: "MH-15-AB-1234", route: nashikToCbsRoute._id, departureTime: "09:00 AM" },
//             { busNumber: "MH-15-CD-5678", route: nashikToCbsRoute._id, departureTime: "09:30 AM" },
//             { busNumber: "MH-15-EF-9012", route: cbsToGangapurRoute._id, departureTime: "10:00 AM" },
//             { busNumber: "MH-15-GH-3456", route: gangapurToCollegeRoute._id, departureTime: "10:15 AM" }
//         ];

//         await Bus.insertMany(sampleBuses);
//         console.log("🌱 Seeded sample buses.");
        
//         console.log("✅ Database seeding complete!");

//     } catch (error) {
//         console.error("❌ Error seeding database:", error);
//     } finally {
//         // Close the connection
//         mongoose.connection.close();
//         console.log("🔌 Database connection closed.");
//     }
// };
// backend/seed.js
// seedDB();


const mongoose = require('mongoose');
require('dotenv').config();

// Import all models
const Bus = require('./models/Bus');
const Route = require('./models/Route');
const Pass = require('./models/Pass');
const UsageRecord = require('./models/UsageRecord');

// --- IMPORTANT: CONFIGURE YOUR TEST DATA HERE ---
// Replace this with a real Firebase UID of one of your test users.
// You can get this from your user admin panel or the Firebase Console.
const TEST_USER_UID = 'jDTCKlvlSWSCIIV1YXqxvm41Mt92';
// -------------------------------------------------

const seedDatabase = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing pass data
    await Pass.deleteMany({});
    await UsageRecord.deleteMany({});
    console.log('Previous pass data cleared.');

    // Create a new sample pass
    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + 30); // Set expiry to 30 days from now

    await Pass.create({
      userId: TEST_USER_UID,
      passCode: `SS-MON-${Math.floor(1000 + Math.random() * 9000)}`,
      passType: 'monthly',
      startDate: today,
      expiryDate: expiry,
      status: 'active',
      fromLocation: 'Central Station',
      toLocation: 'Tech Park',
    });

    console.log('✅ Sample pass created successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Disconnect from the database
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};
const mongoose = require('mongoose');
require('dotenv').config();

// Import the models
const Route = require('./models/Route');
const Bus = require('./models/Bus');

const sampleRoutes = [
    { 
        from: "Nashik Road", to: "CBS", distance: "12 km", duration: "30 mins",
        fromCoords: { lat: 19.9622, lng: 73.8346 }, // Nashik Road Station approx. coords
        toCoords: { lat: 19.9985, lng: 73.7807 }   // CBS approx. coords
    },
    { 
        from: "CBS", to: "Gangapur Road", distance: "8 km", duration: "25 mins",
        fromCoords: { lat: 19.9985, lng: 73.7807 },
        toCoords: { lat: 20.0076, lng: 73.7501 }   // Gangapur Road approx. coords
    },
    { 
        from: "Gangapur Road", to: "College Road", distance: "5 km", duration: "15 mins",
        fromCoords: { lat: 20.0076, lng: 73.7501 },
        toCoords: { lat: 20.0090, lng: 73.7635 }   // College Road approx. coords
    },
    // --- ADDED NASHIK TO PUNE ---
    {
        from: "Nashik", to: "Pune", distance: "210 km", duration: "4 hours",
        fromCoords: { lat: 19.9975, lng: 73.7898 }, // Nashik City approx. coords
        toCoords: { lat: 18.5204, lng: 73.8567 }   // Pune City approx. coords
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Database connected for seeding.");

        await Route.deleteMany({});
        await Bus.deleteMany({});
        console.log("🧹 Cleared existing routes and buses.");

        const createdRoutes = await Route.insertMany(sampleRoutes);
        console.log("🌱 Seeded sample routes with coordinates.");

        // Find routes to assign buses
        const nashikToCbsRoute = createdRoutes.find(r => r.from === "Nashik Road" && r.to === "CBS");
        const nashikToPuneRoute = createdRoutes.find(r => r.from === "Nashik" && r.to === "Pune");
        
        const sampleBuses = [];
        if (nashikToCbsRoute) {
            sampleBuses.push(
                { busNumber: "MH-15-AB-1234", route: nashikToCbsRoute._id, departureTime: "09:00 AM" },
                { busNumber: "MH-15-CD-5678", route: nashikToCbsRoute._id, departureTime: "09:30 AM" }
            );
        }
        if (nashikToPuneRoute) {
             sampleBuses.push(
                { busNumber: "MH-12-XY-9999", route: nashikToPuneRoute._id, departureTime: "07:00 AM" }
             );
        }
        // Add buses for other routes if needed...

        if (sampleBuses.length > 0) {
             await Bus.insertMany(sampleBuses);
             console.log("🌱 Seeded sample buses.");
        }
        
        console.log("✅ Database seeding complete!");

    } catch (error) {
        console.error("❌ Error seeding database:", error);
    } finally {
        mongoose.connection.close();
        console.log("🔌 Database connection closed.");
    }
};

seedDB();

// Run the seeder function
seedDatabase();
