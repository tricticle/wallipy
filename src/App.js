import React from 'react';
import './App.css';
import './script';

const MyComponent = () => {
  return (
    <div>
      <nav className="nav-tab">
        <div className="image-text">
          <span className="image">
            <img src="icon.png" alt="recreit" />
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
        <div className="art"></div>
        <form id="subredditForm">
          <input type="text" id="subredditInput" placeholder="subreddit name" />
          <input type="submit" value="Generate Art" />
          <input type="button" id="saveArtButton" value="Save Art" />
        </form>
      </div>
      <footer className="about-page">
        <h6>2023 copyright to tricticle</h6>
        <p>all Generated images[arts] credits goes to <a href="https://www.reddit.com/">creators</a></p>
      </footer>
    </div>
  );
};

export default MyComponent;
