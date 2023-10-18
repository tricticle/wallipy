const axios = require('axios');

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const subreddit = req.query.subreddit; // Use the subreddit query parameter
      const response = await axios.get(`https://www.reddit.com/r/${subreddit}/top.json?limit=99`);

      if (response.status === 200) {
        const data = response.data;
        res.status(200).json(data);
      } else {
        res.status(response.status).end();
      }
    } else {
      res.status(405).end(); // Method Not Allowed
    }
  } catch (error) {
    console.error('Error fetching subreddit data:', error);
    res.status(500).end(); // Internal Server Error
  }
}
