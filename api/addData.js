// api/addData.js

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
      description: String
    }
  ]
});

function getImageCollection(username) {
  return mongoose.model(`Image_${username}`, imageSchema);
}

export default async (req, res) => {
  try {
    const { title, imageUrl, description, username } = req.body;

    // Get or create a collection for the specific username
    const Image = getImageCollection(username);

    // Check if the user already exists in the database
    let userImage = await Image.findOne({ username });

    if (!userImage) {
      // If the user doesn't exist, create a new user document
      userImage = new Image({
        username,
        data: []
      });
    }

    // Add the new data to the user's data array
    userImage.data.push({ title, imageUrl, description });

    // Save the updated user document
    await userImage.save();
    res.status(201).json(userImage.data);
  } catch (error) {
    res.status(500).json({ error: 'Error adding data to MongoDB' });
  }
};
