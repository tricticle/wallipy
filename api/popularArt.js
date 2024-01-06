// api/popularArt.js

import mongoose from 'mongoose'; // Import Mongoose if not already imported
require('dotenv').config(); // If not already configured

// Initialize your MongoDB connection here (similar to how it's done in your Express server)
mongoose.connect(process.env.MONGODB_URI_APP, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const imageSchema = new mongoose.Schema({
  username: String,
  data: [
    {
      title: String,
      imageUrl: { type: String, unique: true },
      creator: String
    }
  ]
});

export default async (req, res) => {
  try {
    const urlCounts = {}; // Count the occurrences of each URL
    const urlDetails = {}; // Store title and creator information for each URL

    // List all collections in the database
    const allCollections = await mongoose.connection.db.listCollections().toArray();

    for (const collectionInfo of allCollections) {
      const collectionName = collectionInfo.name;
      const Image = mongoose.model(collectionName, imageSchema);
      const collectionData = await Image.find();

      if (collectionData.length > 0) {
        collectionData.forEach((item) => {
          item.data.forEach((image) => {
            const imageUrl = image.imageUrl;
            const title = image.title;
            const creator = image.creator;

            // Update URL count
            urlCounts[imageUrl] = (urlCounts[imageUrl] || 0) + 1;

            // Store title and creator information for each URL
            if (!urlDetails[imageUrl]) {
              urlDetails[imageUrl] = { title, creator };
            }
          });
        });
      }
    }

    // Filter the URLs to include only those that are repeated
    const repeatedUrls = Object.keys(urlCounts).filter((url) => urlCounts[url] > 1);

    if (repeatedUrls.length === 0) {
      return res.status(404).json({ error: 'No repeated URLs found in any collection' });
    }

    // Sort the repeated URLs by their repeat count in descending order
    repeatedUrls.sort((a, b) => urlCounts[b] - urlCounts[a]);

    // Create an array of objects with URL, title, creator, and repeat count
    const rankedRepeatedUrlDetails = repeatedUrls.map((url) => ({
      imageUrl: url,
      title: urlDetails[url].title,
      creator: urlDetails[url].creator,
      repeatCount: urlCounts[url],
    }));

    res.json(rankedRepeatedUrlDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching data from MongoDB' });
  }
};
