import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [imageUrls, setImageUrls] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showNsfw, setShowNsfw] = useState(false);
  const [showMessage, setShowMessage] = useState(true);
  const [selectedSubreddit, setSelectedSubreddit] = useState("wallpaper");

  const subreddits = ["wallpaper","amoledbackgrounds","midjourneyfantasy","patchuu","imaginarysliceoflife","animeart","moescape","fantasymoe","fantasyanimeart","animewallpaper","awwnime"];

  useEffect(() => {
    const subreddit = selectedSubreddit;
    const apiUrl = `https://www.reddit.com/r/${subreddit}.json?sort=hot&limit=99`;

    // Fetch data from Reddit API
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        // Filter URLs of images
        const urls = data.data.children
          .filter((post) => post.data.post_hint === "image" && (showNsfw || !post.data.over_18))
          .map((post) => post.data.url);
        // Set the image URLs state
        setImageUrls(urls);

        // Set the first image as the current index
        setCurrentImageIndex(0);
      })
      .catch((error) => console.error(error));
  }, [selectedSubreddit, showNsfw]);

  const handleClick = (event) => {
    const clickX = event.clientX;
    const artWidth = event.target.offsetWidth;
    setShowMessage(false);

    if (clickX < artWidth / 2) {
      // Clicked on the left side of the art element, go to previous image
      setCurrentImageIndex((currentImageIndex - 1 + imageUrls.length) % imageUrls.length);
    } else {
      // Clicked on the right side of the art element, go to next image
      setCurrentImageIndex((currentImageIndex + 1) % imageUrls.length);
    }
  };

  const handleSaveClick = () => {
    // Download the current image
    const imageUrl = imageUrls[currentImageIndex];
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "art.jpg";
    a.click();
  };

  const handleToggle = () => {
    setShowNsfw(!showNsfw);
  };

  const handleSelectChange = (event) => {
    setSelectedSubreddit(event.target.value);
  };


  return (
    <>
    <section className="header"><h1>wallipy.</h1></section>
      <div className="container">
        <div className="art" onClick={handleClick} style={{ backgroundImage: `url(${imageUrls[currentImageIndex]})` }}>
          {showMessage && <div className="message">Click on the left or right side to change the image</div>}
        </div>
        <form id="subredditForm">
          <select value={selectedSubreddit} onChange={handleSelectChange}>
            {subreddits.map((subreddit) => (
              <option key={subreddit} value={subreddit}>
                {subreddit}
              </option>
            ))}
          </select>
          <input type="button" id="saveArtButton" value="Save Art" onClick={handleSaveClick} />
          <div className="toggle">
            <input type="checkbox" id="nsfwToggle" checked={showNsfw} onChange={handleToggle} />
            <label htmlFor="nsfwToggle">Show NSFW Content</label>
          </div>
        </form>
      </div>
      <footer className="about-page">
          <h6>2023 copyright to tricticle</h6>
          <p>
            all Generated images[arts] credits goes to <a href="https://www.reddit.com/">creators</a>
          </p>
        </footer>
    </>
  );
}

export default App;