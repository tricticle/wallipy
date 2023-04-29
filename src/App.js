import React, { useState } from "react";
import "./App.css";

function App() {
  const [imageUrls, setImageUrls] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleSubmit = (event) => {
    event.preventDefault();

    const subreddit = event.target.subredditInput.value;
    const apiUrl = `https://www.reddit.com/r/${subreddit}/hot.json`;

    // Fetch data from Reddit API
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        // Filter URLs of images
        const urls = data.data.children
          .filter((post) => post.data.post_hint === "image")
          .map((post) => post.data.url);

        // Set the image URLs state
        setImageUrls(urls);

        // Set the first image as the current index
        setCurrentImageIndex(0);
      })
      .catch((error) => console.error(error));
  };

  const handleClick = (event) => {
    const clickX = event.clientX;
    const artWidth = event.target.offsetWidth;

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

  return (
    <>
        <nav className="nav-tab">
        <div className="image-text">
          <span className="image">
            <img src="assets/icon.png" alt="recreit" />
          </span>
        </div>
        <div className="menu-bar">
          <div className="menu">
            <a href="https://anilist.co/user/tricticle/">
              <i className="fa-solid fa-heart"></i>
              <span className="anime">anime</span>
            </a>
            <a href="https://open.spotify.com/user/316utwgq5edsqyr5h43eous2mcjq?si=5e027e2dae584ffa">
              <i className="fa-brands fa-spotify"></i>
              <span className="spotify">spotify</span>
            </a>
            <a href="https://www.instagram.com/tricticle/">
              <i className="fa-brands fa-instagram"></i>
              <span className="">instagram</span>
            </a>
            <a href="https://www.youtube.com/channel/UCdIteieIkYQzUdsxTkWCfwg">
              <i className="fa-brands fa-youtube"></i>
              <span className="youtube">youtube</span>
            </a>
            <a href="https://www.reddit.com/user/tricticle">
              <i className="fa-brands fa-reddit"></i>
              <span className="reddit">reddit</span>
            </a>
            <a href="https://www.pixiv.net/en/users/76712418">
              <i className="fa-solid fa-paintbrush"></i>
              <span className="pixiv">pixiv</span>
            </a>
          </div>
        </div>
      </nav>
    <div className="container">
      <div className="art" onClick={handleClick} style={{ backgroundImage: `url(${imageUrls[currentImageIndex]})` }} />
      <form onSubmit={handleSubmit} id="subredditForm">
        <input type="text" id="subredditInput" placeholder="subreddit name" />
        <input type="submit" value="Generate Art" />
        <input type="button" id="saveArtButton" value="Save Art" onClick={handleSaveClick} />
      </form>
      <footer className="about-page">
        <h6>2023 copyright to tricticle</h6>
        <p>
          all Generated images[arts] credits goes to <a href="https://www.reddit.com/">creators</a>
        </p>
      </footer>
    </div>
    </>
  );
}

export default App;