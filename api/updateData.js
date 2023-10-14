// api/updateData.js

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
    const { imageUrl, username, newTitle, newDescription } = req.body;

    // Get the specific collection for the username
    const Image = getImageCollection(username);

    // Find the user by username
    const userImage = await Image.findOne({ username });

    if (!userImage) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the image with the matching imageUrl in the user's data array
    const imageToUpdate = userImage.data.find((image) => image.imageUrl === imageUrl);

    if (!imageToUpdate) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Update the image's title and description
    imageToUpdate.title = newTitle;
    imageToUpdate.description = newDescription;

    // Save the updated user document
    await userImage.save();

    res.json({ message: 'Image updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating data in MongoDB' });
  }
};
