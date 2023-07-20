/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import "./App.css";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { inject } from "@vercel/analytics";

function Art({ imageData, handleSaveClick, handleLikeClick, likedImages }) {
  return (
    <div className="art">
      <img src={imageData.url} alt="Artwork" loading="lazy" />
      <ButtonGroup
        imageData={imageData}
        handleSaveClick={handleSaveClick}
        handleLikeClick={handleLikeClick}
        likedImages={likedImages}
      />
    </div>
  );
}

function ArtDetails({ title, author }) {
  return (
    <div className="art-details">
      <h3>{title}</h3>
      <p>By {author}</p>
    </div>
  );
}

function ButtonGroup({ imageData, handleSaveClick, handleLikeClick, likedImages }) {
  const isLiked = likedImages.includes(imageData.url);

  return (
    <div className="button-group">
      <ArtDetails title={imageData.title} author={imageData.author} />
      <button onClick={() => handleSaveClick(imageData.url)} className={isLiked ? "save" : ""}>
        <i className="fa-solid fa-link"></i>
      </button>
      <button onClick={() => handleLikeClick(imageData.url)} className={isLiked ? "liked" : ""}>
        {isLiked ? <i className="fas fa-heart"></i> : <i className="far fa-heart"></i>}
      </button>
    </div>
  );
}

function ProfileDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="profile">
      <div className="profile-menu" onClick={handleToggle}>
        <img src={user.picture} alt={user.name} />
      </div>
      {isOpen && (
        <div className="dropdown">
          <h4>{user.name}!</h4>
          <button onClick={handleLogout}>
            <i className="fa-solid fa-right-to-bracket"></i> Logout
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  const [imageUrls, setImageUrls] = useState([]);
  const [showNsfw, setShowNsfw] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Wallpaper");
  const [customSubreddit, setCustomSubreddit] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [likedImages, setLikedImages] = useState([]);
  const [showLikedPosts, setShowLikedPosts] = useState(false);

  const {
    isLoading: authIsLoading,
    isAuthenticated,
    loginWithRedirect,
    logout,
    user,
  } = useAuth0();

  const subredditCategories = {
    anime: [
      "patchuu",
      "animeart",
      "officialsenpaiheat",
      "awwnime",
      "moescape",
      "fantasymoe",
      "animelandscapes",
      "neonmoe",
      "joshi_kosei",
      "winterwaifus",
      "awenime",
      "pixivision",
      "streetmoe",
    ],
    AIengines: ["midjourneyfantasy", "StableDiffusion", "animewallpaperai", "aiart"],
    Wallpaper: ["wallpaper", "amoledbackgrounds", "minimalwallpaper"],
    custom: [],
  };

  useEffect(() => {
    let subredditsToFetch = [];

    if (selectedCategory === "custom" && customSubreddit.trim() !== "") {
      subredditsToFetch.push(customSubreddit);
    } else {
      subredditsToFetch = subredditCategories[selectedCategory];
    }

    setIsLoading(true);

    const fetchSubreddits = subredditsToFetch.map((subreddit) => {
      const apiUrl = `https://www.reddit.com/r/${subreddit}.json?sort=hot&limit=99`;
      return fetch(apiUrl)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            console.error(
              `Error occurred while fetching subreddit "${subreddit}": ${response.status} ${response.statusText}`
            );
            return { data: { children: [] } }; // Return empty data in case of error
          }
        })
        .catch((error) => {
          console.error(`Error occurred while fetching subreddit "${subreddit}":`, error);
          return { data: { children: [] } }; // Return empty data in case of error
        });
    });

    Promise.all(fetchSubreddits)
      .then((results) => {
        const posts = results.flatMap((result) =>
          result.data.children.filter((post) => post.data.post_hint === "image" && (showNsfw || !post.data.over_18))
        );

        const urls = posts.map((post) => ({
          url: post.data.url,
          title: post.data.title,
          author: post.data.author,
        }));

        // Randomize the post positions
        const shuffledUrls = shuffleArray(urls);
        setImageUrls(shuffledUrls);

        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error occurred while fetching images:", error);
        setIsLoading(false);
      });
  }, [selectedCategory, showNsfw, customSubreddit]);

  useEffect(() => {
    if (isAuthenticated) {
      // Retrieve liked images from localStorage
      const storedLikedImages = localStorage.getItem("likedImages");
      if (storedLikedImages) {
        setLikedImages(JSON.parse(storedLikedImages));
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      // Store liked images in localStorage
      localStorage.setItem("likedImages", JSON.stringify(likedImages));
    }
  }, [likedImages, isAuthenticated]);

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleSaveClick = async (imageUrl) => {
    if (isAuthenticated) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "art.jpg";

        link.click();

        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error("Error occurred while downloading the image:", error);
        window.open(imageUrl);
      }
    } else {
      loginWithRedirect();
    }
  };

  const handleLikeClick = (imageUrl) => {
    if (likedImages.includes(imageUrl)) {
      setLikedImages(likedImages.filter((url) => url !== imageUrl));
    } else {
      setLikedImages([...likedImages, imageUrl]);
    }
  };

  const handleToggle = () => {
    if (isAuthenticated) {
      setShowNsfw(!showNsfw);
    } else {
      loginWithRedirect();
    }
  };

  const handleCustomSubredditChange = (event) => {
    setCustomSubreddit(event.target.value.trim());
  };

  useEffect(() => {
    const isValidSubreddit = customSubreddit && customSubreddit.length > 69;

    if (isValidSubreddit) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [customSubreddit]);

// eslint-disable-next-line
  const handleProfileClick = () => {
    setShowProfile(!showProfile);
    setShowLikedPosts(false); // Hide liked posts when profile is clicked
  };

  const handleLikedPostsClick = () => {
    setShowLikedPosts(!showLikedPosts);
  };

  inject();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <section className="header">
        <h1>wallipy.</h1>
        {!isAuthenticated && <button onClick={loginWithRedirect}>Log In</button>}
        {isAuthenticated && (
          <ProfileDropdown user={user} onLogout={handleLogout} />
        )}
      </section>
      <div className="container">
        {isLoading || authIsLoading ? (
          <div className="loading">
            <i className="fa-solid fa-spinner"></i>
          </div>
        ) : (
          <>
            <div className="art-grid">
              {imageUrls.map((imageData, index) => (
                <Art
                  key={index}
                  imageData={imageData}
                  handleSaveClick={handleSaveClick}
                  handleLikeClick={handleLikeClick}
                  likedImages={likedImages}
                />
              ))}
            </div>
            <div className="categories">
              {Object.keys(subredditCategories).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "active" : ""}
                >
                  {category}
                </button>
              ))}
            </div>
            {selectedCategory === "custom" && (
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
              <label htmlFor="nsfwToggle">Show NSFW</label>
            </div>
            {isAuthenticated && (
              <div className="liked-section">
                <button
                  onClick={handleLikedPostsClick}
                  className="liked-posts-button"
                >
                  <i className="fa-solid fa-heart"></i>Liked Posts
                </button>
                {showLikedPosts && likedImages.length > 0 ? (
                  <div className="art-grid">
                    {likedImages.map((imageUrl, index) => {
                      const imageData = imageUrls.find(
                        (data) => data.url === imageUrl
                      );
                      if (!imageData) {
                        return null; // Skip if the imageData is not found
                      }

                      return (
                        <div className="art" key={index}>
                          <img
                            src={imageUrl}
                            alt="Liked Artwork"
                            loading="lazy"
                          />
                          <ButtonGroup
                            imageData={imageData}
                            handleSaveClick={handleSaveClick}
                            handleLikeClick={handleLikeClick}
                            likedImages={likedImages}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  showLikedPosts && <p>No liked posts yet.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <footer className="about-page">
        <h5>Wallipy v1.0</h5>
        <h6>
          This website is a React application that fetches and displays images
          from different subreddits. Users can save and like images and search a
          custom subreddit. Authenticated users can manage their liked posts,
          save artworks, and toggle NSFW content.
        </h6>
        <p>
          All arts credits go to &nbsp;
          <a href="https://www.reddit.com/">creators</a>
        </p>
      </footer>
    </>
  );
}

function AuthWrapper() {
  return (
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <App />
    </Auth0Provider>
  );
}

export default AuthWrapper;