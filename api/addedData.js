// api/addedData.js

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

function getImageCollection(username) {
  return mongoose.model(`Image_${username}`, imageSchema);
}

export default async (req, res) => {
  try {
    const { username } = req.query;

    // Get the specific collection for the username
    const Image = getImageCollection(username);

    // Find the user by username and return their data array
    const userImage = await Image.findOne({ username });

    if (!userImage) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userImage.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching added data from MongoDB' });
  }
};
