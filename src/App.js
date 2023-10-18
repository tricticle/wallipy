/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

function App() {
  const [images, setImages] = useState([]);
  const [addedData, setAddedData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem("selectedCategory") || "Wallpaper";});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNSFW, setShowNSFW] = useState(false);
  const [showLikedSection, setShowLikedSection] = useState(false);
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const [customSubreddit, setCustomSubreddit] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [showCustomImageForm, setShowCustomImageForm] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [customImageTitle, setCustomImageTitle] = useState("");
  const [customImageDescription, setCustomImageDescription] = useState("");
  const [likedImages, setLikedImages] = useState([]); // Populate this array with your liked images data
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [headerStyle, setHeaderStyle] = useState({});

  const serverUrl = process.env.REACT_APP_SERVER_URL;

  const isRefreshed = useRef(false);

  useEffect(() => {
    const fetchRedditImages = async () => {
      try {
        let subredditList = subredditCategories[selectedCategory] || [];
    
        if (selectedCategory === "custom" && customSubreddit.trim() !== "") {
          subredditList = [customSubreddit];
        }
    
        // Create an array of promises to fetch data from multiple subreddits
        const fetchSubreddits = subredditList.map(async (subreddit) => {
          try {
            const response = await axios.get(`${serverUrl}reddit?subreddit=${subreddit}`);
            return response.data;
          } catch (error) {
            // Handle the case when the subreddit does not exist or there's an error
            console.error(`Error fetching subreddit ${subreddit}:`, error);
            return null; // Return null for the non-existing subreddit
          }
        });
    
        // Fetch data from all subreddits concurrently using Promise.all
        const results = await Promise.all(fetchSubreddits);

         const validResults = results.filter((result) => result !== null);
    
        // Flatten and filter posts
        const posts = validResults.flatMap((result) =>
        result.data.children.filter(
          (post) =>
            post.data.post_hint === 'image' && (showNSFW || !post.data.over_18)
        )
      );
    
        const uniqueUrls = new Set(); // Create a Set to store unique URLs
    
        // Map filtered posts to the desired format
        const imageList = posts.map((post) => ({
          title: post.data.title,
          imageUrl: post.data.url,
          description: post.data.author,
          isNSFW: post.data.over_18, // Check if the post is NSFW
        })).filter((image) => {
          if (!uniqueUrls.has(image.imageUrl)) {
            uniqueUrls.add(image.imageUrl);
            return true;
          }
          return false;
        });
    
        setImages(imageList);
      } catch (error) {
        console.error('Error fetching Reddit images:', error);
      }
    };
    
    fetchRedditImages();
  }, [selectedCategory, showNSFW, customSubreddit]);
  


  const fetchAddedDataFromMongoDB = async () => {
    try {
      if (isAuthenticated) {
        const response = await axios.get(`${serverUrl}/addedData?username=${user.name}`);
        setAddedData(response.data);
        setLikedImages(response.data);
      }
    } catch (error) {
      console.error('Error fetching added data:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddedDataFromMongoDB();
    }
  }, [user, isAuthenticated, serverUrl]); // Fetch data when the user is authenticated or user changes

  const addDataToMongoDB = async (image) => {
    try {
      if (!isAuthenticated) {
        loginWithRedirect();
        return;
      }

      const { title, imageUrl, description } = image;

      // Include the username from Auth0 user object
      const username = user.name;

      const dataToAdd = {
        title,
        imageUrl,
        description,
        username,
      };
  
      await axios.post(`${serverUrl}/addData`, dataToAdd);
      fetchAddedDataFromMongoDB();
    } catch (error) {
      console.error('Error adding data:', error);
    }
  };

  const openEditModal = (image) => {
    setSelectedImage(image);
    setEditedTitle(image.title);
    setEditedDescription(image.description);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedImage(null);
    setEditedTitle("");
    setEditedDescription("");
    setEditModalOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!isAuthenticated) {
        loginWithRedirect();
        return;
      }

      const updatedData = {
        imageUrl: selectedImage.imageUrl,
        username: user.name,
        newTitle: editedTitle,
        newDescription: editedDescription,
      };

      await axios.put(`${serverUrl}/updateData`, updatedData);
      fetchAddedDataFromMongoDB();
      closeEditModal();
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const removeDataFromMongoDB = async (imageUrl) => {
    try {
      if (!isAuthenticated) {
        loginWithRedirect();
        return;
      }

      await axios.delete(`${serverUrl}/removeData`, { data: { imageUrl, username: user.name } });
      fetchAddedDataFromMongoDB();
    } catch (error) {
      console.error('Error removing data:', error);
    }
  };

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
    localStorage.setItem("selectedCategory", selectedCategory);
    if (!isRefreshed.current) {
      isRefreshed.current = true;
    } else {
      // Perform a page refresh when the category changes
      window.location.reload();
    }
  }, [selectedCategory]);

  const openCustomImageForm = () => {
    setShowCustomImageForm(true);
  };

  const closeCustomImageForm = () => {
    setShowCustomImageForm(false);
  };

  const handleCustomImageSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!isAuthenticated) {
        loginWithRedirect();
        return;
      }

      const customImage = {
        title: customImageTitle,
        imageUrl: customImageUrl,
        description: customImageDescription,
      };

      // Send a POST request to add the custom image and data
      await addDataToMongoDB(customImage);

      // Clear the form and close it
      setCustomImageUrl("");
      setCustomImageTitle("");
      setCustomImageDescription("");
      closeCustomImageForm();
    } catch (error) {
      console.error('Error adding custom image and data:', error);
    }
  };

  
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;

    if (deltaX > 50) {
      // Swipe right, go to the previous image
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? likedImages.length - 1 : prevIndex - 1
      );
    } else if (deltaX < -50) {
      // Swipe left, go to the next image
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % likedImages.length);
    }
  };

  const handleHeroClick = (e) => {
    const heroSectionWidth = e.currentTarget.offsetWidth;
    const clickX = e.clientX - e.currentTarget.getBoundingClientRect().left;

    if (clickX < heroSectionWidth / 2) {
      // Click on the left side, go to the previous image
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? likedImages.length - 1 : prevIndex - 1
      );
    } else {
      // Click on the right side, go to the next image
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % likedImages.length);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % likedImages.length);
    }, 7000); // Change image every 7 seconds

    return () => {
      clearInterval(intervalId); // Clean up the interval when the component unmounts
    };
  }, [likedImages,currentImageIndex]);

  // Menu toggle

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.menu-btn')) {
        closeMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) {
        closeMenu();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMenuOpen]);

  // Menu toggle over

  const isImageLiked = (imageUrl) => {
    return addedData.some((item) => item.imageUrl === imageUrl);
  };

  useEffect(() => {
    if (likedImages.length > 0) {
      if (currentImageIndex >= 0 && currentImageIndex < likedImages.length) {
        const currentImage = likedImages[currentImageIndex];
        if (currentImage && currentImage.imageUrl) {
          setHeaderStyle({
            backgroundImage: `url(${currentImage.imageUrl})`,
          });
        } else {
          // Handle the case where the current image or its URL is undefined
          setHeaderStyle({}); // Set a default style or placeholder image
        }
      }
    } else {
      // Handle the case where likedImages is empty
      setHeaderStyle({}); // Set a default style or placeholder image
    }
  }, [likedImages, currentImageIndex]);

  return (
    <>
      <section className="wrapper">
          <header className="header"
            style={headerStyle}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={handleHeroClick}
          >
          <h1>wallipy.</h1>
          <div className="menu-btn">
            <button onClick={toggleMenu}>
              <i className="fas fa-bars"></i>
            </button>
            <div className="profile">
              <div className={`dropdown ${isMenuOpen ? 'open' : ''}`}>
                {isAuthenticated ? (
                  <>
                    <img  loading="lazy" src={user.picture} alt={user.name} />
                    <h4>{user.name}!</h4>
                    <h4 className="link">
                      <a href="https://zaap.bio/tricticle">about us</a>
                    </h4>
                    <button onClick={() => logout()}>Log Out</button>
                  </>
                ) : (
                  <button onClick={() => loginWithRedirect()}>Log In</button>
                )}
                {isAuthenticated && user.name === "tricticle" && (
  <button className="add-custom-image-button" onClick={openCustomImageForm}>Add Arts</button>
                )}
              </div>
            </div>
          </div>
        </header>
      </section>
      <div className="adjust">
      <div className={`inset ${showCustomImageForm ? '' : 'hidden'}`}>
        {showCustomImageForm && (
          <div className="edit-modal">
            <h3>Add Custom Image</h3>
            <form onSubmit={handleCustomImageSubmit}>
              <div className="details">
                <label>Title</label>
                <input
                  type="text"
                  value={customImageTitle}
                  onChange={(e) => setCustomImageTitle(e.target.value)}
                />
                <label>Description</label>
                <textarea
                  value={customImageDescription}
                  onChange={(e) => setCustomImageDescription(e.target.value)}
                />
                <label>Image URL</label>
                <input
                  type="text"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                />
              </div>
              <div className="update-buttons">
                <button type="submit">Add</button>
                <button onClick={closeCustomImageForm}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
      <div className="container">
        <button className="liked-posts-button" onClick={() => setShowLikedSection(!showLikedSection)}>
          <i className="fa-solid fa-heart"></i>Liked Posts
        </button>
      {showLikedSection && (
        <div className="liked-section">
          <h2>Liked and Save section</h2>
          <div className="art-grid">
            {addedData.map((item, index) => (
              <div className="art" key={index}>
                <img loading="lazy" src={item.imageUrl} alt={item.title} />
                <div className="button-group">
                  <div className="art-details">
                    <h3>{item.title}</h3>
                    <p>by {item.description}</p>
                  </div>
                  <button onClick={() => openEditModal(item)}><i className="fa-solid fa-plus"></i></button>
                  <button onClick={() => removeDataFromMongoDB(item.imageUrl)}><i className="fa-solid fa-trash"></i></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {editModalOpen && (
        <div className="inset">
          <div className="edit-modal">
            <h3>Edit Post</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="details">
                <label>Title</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
                <label>Description</label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                />
              </div>
              <div className="update-buttons">
                <button type="submit">Save</button>
                <button onClick={closeEditModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
        <div className="toggle">
          <input
            type="checkbox"
            checked={showNSFW}
            onChange={() => setShowNSFW(!showNSFW)}
          />
          <label htmlFor="nsfwToggle">Show NSFW</label>
        </div>
        <div className="art-grid">
          {images.map((image, index) => (
            <div key={index} className="art">
              <img  loading="lazy" src={image.imageUrl} alt={image.title} />
              <div className="button-group">
                <div className="art-details">
                  <h3>{image.title}</h3>
                  <p>by {image.description}</p>
                </div>
                <button className={isImageLiked(image.imageUrl) ? "liked" : ""}
                  onClick={() => {
                    if (isImageLiked(image.imageUrl)) {
                      removeDataFromMongoDB(image.imageUrl);
                    } else {
                      addDataToMongoDB(image);
                    }
                  }}>
                  <i className="fas fa-heart"></i>
                </button>
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
              {category === "custom" ? "Custom" : category}
            </button>
          ))}
        </div>
        {selectedCategory === "custom" && (
            <input className="custom"
              type="text"
              placeholder="Enter subreddit name"
              value={customSubreddit}
              onChange={(e) => {
                console.log("customSubreddit value:", e.target.value);
                setCustomSubreddit(e.target.value);
              }}
            />
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
      </div>
    </>
  );
}

function AuthenticatedApp() {
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

export default AuthenticatedApp;