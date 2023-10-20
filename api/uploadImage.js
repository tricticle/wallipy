// api/uploadImage.js

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
      imageUrl: String,
      creator: String
    }
  ]
});

function getImageCollection(username) {
  return mongoose.model(`Image_${username}`, imageSchema);
}

export default async (req, res) => {
  try {
    const { username, title, creator } = req.body;
    const imageUrl = req.file.path; // The path to the uploaded image

    // Get or create a collection for the specific username
    const Image = getImageCollection(username);

    // Check if the user already exists in the database
    let userImage = await Image.findOne({ username });

    if (!userImage) {
      // If the user doesn't exist, create a new user document
      userImage = new Image({
        username,
        data: [],
      });
    }

    if (username !== 'tricticle') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Add the new data to the user's data array
    userImage.data.push({ title, imageUrl, creator });

    // Save the updated user document
    await userImage.save();

    res.status(201).json(userImage.data);
  } catch (error) {
    res.status(500).json({ error: 'Error uploading image and data to MongoDB' });
  }
};
