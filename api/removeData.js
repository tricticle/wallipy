// api/removeData.js

import mongoose from 'mongoose'; // Import Mongoose if not already imported
require('dotenv').config(); // If not already configured

// Initialize your MongoDB connection here (similar to how it's done in your Express server)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const imageSchema = new mongoose.Schema({
  username: String,
  data: [
    {
      title: String,
      imageUrl: String,
      description: String
    }
  ]
});

function getImageCollection(username) {
  return mongoose.model(`Image_${username}`, imageSchema);
}

export default async (req, res) => {
  try {
    const { imageUrl, username } = req.body;

    // Get the specific collection for the username
    const Image = getImageCollection(username);

    // Find the user by username
    const userImage = await Image.findOne({ username });

    if (!userImage) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove the image with the matching imageUrl from the user's data array
    userImage.data = userImage.data.filter((image) => image.imageUrl !== imageUrl);

    // Save the updated user document
    await userImage.save();

    res.json({ message: 'Image removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error removing data from MongoDB' });
  }
};
