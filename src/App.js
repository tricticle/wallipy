/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import "./App.css";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";

function App() {
  const [imageData, setImageData] = useState([]);
  const [showNsfw, setShowNsfw] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("anime");
  const [customSubreddit, setCustomSubreddit] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [likedImages, setLikedImages] = useState([]);

  const {
    isLoading: authIsLoading,
    isAuthenticated,
    loginWithRedirect,
    logout,
    user
  } = useAuth0();

  const subredditCategories = {
    anime: ["patchuu", "officialsenpaiheat", "animewallpaper", "awwnime", "moescape", "fantasymoe", "animelandscapes", "neonmoe"],
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

    Promise.all(
      subredditsToFetch.map((subreddit) => {
        const apiUrl = `https://www.reddit.com/r/${subreddit}.json?sort=hot&limit=1`;
        return fetch(apiUrl).then((response) => response.json());
      })
    )
      .then((results) => {
        const posts = results.flatMap((result) =>
          result.data.children.filter(
            (post) => post.data.post_hint === "image" && (showNsfw || !post.data.over_18)
          )
        );

        const data = posts.map((post) => ({
          imageUrl: post.data.url,
          title: post.data.title,
          creatorName: post.data.author,
          profilePicture: `https://www.reddit.com/user/${post.data.author}/avatar`,
        }));

        // Randomize the post positions
        const shuffledData = shuffleArray(data);
        setImageData(shuffledData);

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
    setCustomSubreddit(event.target.value);
  };

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
  };

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
              {imageData.map((data, index) => (
                <div className="art" key={index}>
                  <img src={data.imageUrl} alt="Artwork" loading="lazy" />
                  <div className="button-group">
                    <button
                      onClick={() => handleSaveClick(data.imageUrl)}
                      className={likedImages.includes(data.imageUrl) ? "liked" : ""}
                    >
                      Save
                    </button>
                    {isAuthenticated && (
                      <button
                        onClick={() => handleLikeClick(data.imageUrl)}
                        className={likedImages.includes(data.imageUrl) ? "liked" : ""}
                      >
                        {likedImages.includes(data.imageUrl) ? "Liked" : "Like"}
                      </button>
                    )}
                  </div>
                  <div className="art-details">
                    <p>{data.title}</p>
                    <div className="creator-info">
                      <img src={data.profilePicture} alt={data.creatorName} />
                      <span>{data.creatorName}</span>
                    </div>
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
              <label>
                <input
                  type="checkbox"
                  checked={showNsfw}
                  onChange={handleToggle}
                />
                Show NSFW
              </label>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function AuthWrapper() {
  return (
    <Auth0Provider
      domain="tricticle.jp.auth0.com"
      clientId="OVSSMN7SDqVsUrybTdJkDS04v3A3AlIG"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <App />
    </Auth0Provider>
  );
}

export default AuthWrapper;