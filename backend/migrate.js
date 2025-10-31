const mongoose = require('mongoose');
const Route = require('./models/Route'); // Make sure this path is correct
require('dotenv').config(); // So we can use MONGO_URI

const migrateData = async () => {
  try {
    // 1. Connect to your database
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Successfully connected to MongoDB');

    // 2. Find all routes
    const routes = await Route.find();
    console.log(`Found ${routes.length} routes to check...`);

    let updatedCount = 0;

    // 3. Loop through every route
    for (const route of routes) {
      // Check if the distance is a string (like "188")
      if (typeof route.distance === 'string') {
        
        // 4. Parse the string to get the number
        const newDistance = parseInt(route.distance); // "188" -> 188

        if (!isNaN(newDistance)) {
          // 5. Update the field and save
          route.distance = newDistance;
          await route.save();
          console.log(`Updated route ${route.from} -> ${route.to}. New distance: ${newDistance}`);
          updatedCount++;
        } else {
          console.warn(`Could not parse distance for route: ${route.from} -> ${route.to}. Value: "${route.distance}"`);
        }
      }
    }

    console.log(`\nMigration complete. Updated ${updatedCount} routes.`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // 6. Disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

// Run the migration
migrateData();

