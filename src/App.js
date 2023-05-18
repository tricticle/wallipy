import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [imageUrls, setImageUrls] = useState([]);
  const [showNsfw, setShowNsfw] = useState(false);
  const [selectedSubreddit, setSelectedSubreddit] = useState("wallpaper");
  const [customSubreddit, setCustomSubreddit] = useState("");

  const subreddits = [
    "wallpaper",
    "amoledbackgrounds",
    "midjourneyfantasy",
    "patchuu",
    "imaginarysliceoflife",
    "animeart",
    "moescape",
    "fantasymoe",
    "animewallpaper",
    "awwnime",
  ];

  useEffect(() => {
    const subreddit = selectedSubreddit === "custom" ? customSubreddit : selectedSubreddit;
    const apiUrl = `https://www.reddit.com/r/${subreddit}.json?sort=hot&limit=99`;

    // Fetch data from Reddit API
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        // Filter URLs of images
        const posts = data.data.children.filter(
          (post) =>
            post.data.post_hint === "image" && (showNsfw || !post.data.over_18)
        );
        const urls = posts.map((post) => post.data.url);

        // Set the image URLs
        setImageUrls(urls);
      })
      .catch((error) => console.error(error));
  }, [selectedSubreddit, showNsfw, customSubreddit]);

  const handleSaveClick = (imageUrl) => {
    // Download the specified image
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "art.jpg";
    a.click();
  };

  const handleToggle = () => {
    setShowNsfw(!showNsfw);
  };

  const handleSelectChange = (event) => {
    const value = event.target.value;
    setSelectedSubreddit(value);
  };

  const handleCustomSubredditChange = (event) => {
    setCustomSubreddit(event.target.value);
  };

  return (
    <>
      <section className="header">
        <h1>wallipy.</h1>
      </section>
      <div className="container">
      <div className="art-grid">
        {imageUrls.map((imageUrl, index) => (
          <div className="art" key={`${imageUrl}-${index}`}>
            <img src={imageUrl} alt="Artwork" key={`${imageUrl}-${index}`} />
            <button onClick={() => handleSaveClick(imageUrl)}>Save</button>
          </div>
        ))}
      </div>
        <form id="subredditForm">
          <select value={selectedSubreddit} onChange={handleSelectChange}>
            {subreddits.map((subreddit) => (
              <option key={subreddit} value={subreddit}>
                {subreddit}
              </option>
            ))}
            <option value="custom">Custom Subreddit</option>
          </select>
          {selectedSubreddit === "custom" && (
            <input
              type="text"
              value={customSubreddit}
              onChange={handleCustomSubredditChange}
              placeholder="Enter subreddit name"
            />
          )}
          <div className="toggle">
            <input
              type="checkbox"
              id="nsfwToggle"
              checked={showNsfw}
              onChange={handleToggle}
            />
            <label htmlFor="nsfwToggle">Show NSFW Content</label>
          </div>
        </form>
      </div>
      <footer className="about-page">
        <h6>2023 copyright to tricticle</h6>
        <p>
          All generated images (arts) credits go to{" "}
          <a href="https://www.reddit.com/">creators</a>
        </p>
      </footer>
    </>
  );
}

export default App;