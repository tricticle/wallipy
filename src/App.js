/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import "./App.css";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { inject } from '@vercel/analytics';

function App() {
  const [imageUrls, setImageUrls] = useState([]);
  const [showNsfw, setShowNsfw] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("anime");
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
    user
  } = useAuth0();

  const subredditCategories = {
    anime: ["patchuu", "animeart", "officialsenpaiheat", "awwnime", "moescape", "fantasymoe", "animelandscapes", "neonmoe", "joshi_kosei", "winterwaifus", "awenime", "pixivision", "streetmoe"],
    AIengines: ["midjourneyfantasy", "StableDiffusion", "animewallpaperai", "aiart"],
    Wallpaper: ["wallpaper", "amoledbackgrounds", "minimalwallpaper"],
    custom: []
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
      const apiUrl = `https://www.reddit.com/r/${subreddit}.json?sort=hot&limit=2`;
      return fetch(apiUrl)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            console.error(`Error occurred while fetching subreddit "${subreddit}": ${response.status} ${response.statusText}`);
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
          result.data.children.filter(
            (post) => post.data.post_hint === "image" && (showNsfw || !post.data.over_18)
          )
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
  

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
    setShowLikedPosts(false); // Hide liked posts when profile is clicked
  };

  const handleLikedPostsClick = () => {
    setShowLikedPosts(!showLikedPosts);
  };

  inject();

  return (
    <>
      <section className="header">
        <h1>wallipy.</h1>
        {!isAuthenticated && (
          <button onClick={loginWithRedirect}>Log In</button>
        )}
        {isAuthenticated && (
          <div className="profile" onClick={handleProfileClick}>
            <img src={user.picture} alt={user.name} />
            {showProfile && <h4>{user.name}!</h4>}
            {showProfile && <button onClick={logout}>Log Out</button>}
          </div>
        )}
      </section>
      <div className="container">
        {isLoading || authIsLoading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="art-grid">
              {imageUrls.map((imageData, index) => (
                <div className="art" key={index}>
                  <img src={imageData.url} alt="Artwork" loading="lazy" />
                  <div className="button-group">
                    <div className="art-details">
                      <h3>{imageData.title}</h3>
                      <p>By {imageData.author}</p>
                    </div>
                    <button
                      onClick={() => handleSaveClick(imageData.url)}
                      className={likedImages.includes(imageData.url) ? "save" : ""}
                    >
                      Save
                    </button>
                    {isAuthenticated && (
                      <button
                        onClick={() => handleLikeClick(imageData.url)}
                        className={likedImages.includes(imageData.url) ? "liked" : ""}
                      >
                        {likedImages.includes(imageData.url) ? "Liked" : "Like"}
                      </button>
                    )}
                  </div>
                </div>
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
                <button onClick={handleLikedPostsClick} className="liked-posts-button">
                  Liked Posts
                </button>
                {showLikedPosts && likedImages.length > 0 ? (
  <div className="art-grid">
    {likedImages.map((imageUrl, index) => {
      const imageData = imageUrls.find((data) => data.url === imageUrl);
      if (!imageData) {
        return null; // Skip if the imageData is not found
      }

      return (
        <div className="art" key={index}>
          <img src={imageUrl} alt="Liked Artwork" loading="lazy" />
          <div className="button-group">
            <div className="art-details">
              <h3>{imageData.title}</h3>
              <p>By {imageData.author}</p>
            </div>
            <button onClick={() => handleSaveClick(imageUrl)}>Save</button>
            <button
              onClick={() => handleLikeClick(imageUrl)}
              className="liked"
            >
              Unlike
            </button>
          </div>
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
        <h6>This website is a React application that fetches and displays images from different subreddits. Users can save and like images, and search a custom subreddit. Authenticated users can manage their liked posts, save artworks and toggle nsfw content.</h6>
        <p>
          All arts credits go to
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
        redirect_uri: window.location.origin
      }}
    >
      <App />
    </Auth0Provider>
  );
}

export default AuthWrapper;