/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

function App() {
  const [images, setImages] = useState([]);
  const [addedData, setAddedData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Wallpaper');
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [customSearchResults, setCustomSearchResults] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNSFW, setShowNSFW] = useState(false);
  const [showLikedSection, setShowLikedSection] = useState(false); // State to control liked section visibility
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const serverUrl = process.env.REACT_APP_SERVER_URL;


  useEffect(() => {
    const fetchRedditImages = async () => {
      try {
        const subredditList = subredditCategories[selectedCategory] || [];
        if (subredditList.length === 0) {
          console.warn(`Subreddits not found for category: ${selectedCategory}`);
          return;
        }

        const promises = subredditList.map(async (subreddit) => {
          const response = await axios.get(`https://www.reddit.com/r/${subreddit}/top.json?limit=99`);
          const redditData = response.data.data.children;

          const uniqueUrls = new Set(); // Create a Set to store unique URLs

          const imageList = redditData
            .filter((post) => post.data.url.endsWith('.jpg') || post.data.url.endsWith('.png') || post.data.url.endsWith('.gif'))
            .map((post) => ({
              title: post.data.title,
              imageUrl: post.data.url,
              description: post.data.author,
              isNSFW: post.data.over_18, // Check if the post is NSFW
            }))
            .filter((image) => {
              if (!showNSFW && image.isNSFW) {
                return false; // Skip NSFW content if it's hidden
              }
              if (!uniqueUrls.has(image.imageUrl)) {
                uniqueUrls.add(image.imageUrl);
                return true;
              }
              return false;
            });

          return imageList;
        });

        const results = await Promise.all(promises);
        const allImages = results.flat(); // Flatten the array of image lists

        setImages(allImages);
      } catch (error) {
        console.error('Error fetching Reddit images:', error);
      }
    };

    fetchRedditImages();
  }, [selectedCategory, showNSFW]); // Add showNSFW to the dependency array

  const fetchAddedDataFromMongoDB = async () => {
    try {
      const response = await axios.get(`${serverUrl}/addedData`);
      setAddedData(response.data);
    } catch (error) {
      console.error('Error fetching added data:', error);
    }
  };

  useEffect(() => {
    fetchAddedDataFromMongoDB();
  }, [serverUrl]);

  const addDataToMongoDB = async (image) => {
    try {
      await axios.post(`${serverUrl}/addData`, image);
      fetchAddedDataFromMongoDB();
    } catch (error) {
      console.error('Error adding data:', error);
    }
  };

  const removeDataFromMongoDB = async (imageUrl) => {
    try {
      await axios.delete(`${serverUrl}/removeData`, { data: { imageUrl } });
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
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const performCustomSearch = async () => {
    try {
      const response = await axios.get(`https://www.reddit.com/search.json?q=${customSearchQuery}&limit=30`);
      const searchData = response.data.data.children;

      const searchResults = searchData
        .filter((post) => post.data.url.endsWith('.jpg') || post.data.url.endsWith('.png'))
        .map((post) => ({
          title: post.data.title,
          imageUrl: post.data.url,
          description: post.data.author,
        }));

      setCustomSearchResults(searchResults);
    } catch (error) {
      console.error('Error fetching custom search results:', error);
    }
  };

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

  return (
    <>
      <section className="wrapper">
        <header className='header'>
          <h1>wallipy</h1>
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
              </div>
            </div>
          </div>
        </header>
      </section>
      <div className="sec">
        <div className="sec-bar">
          <input
            type="text"
            placeholder="search..."
            value={customSearchQuery}
            onChange={(e) => setCustomSearchQuery(e.target.value)}
          />
          <button onClick={performCustomSearch}><i className="fas fa-magnifying-glass"></i></button>
        </div>
        <div className="container">
          {customSearchResults.map((result, index) => (
            <div className="art-grid" key={index}>
              <div className="art">
                <img  loading="lazy" src={result.imageUrl} alt={result.title} />
                <div className="button-group">
                  <div className="art-details">
                    <h3>{result.title}</h3>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="container">
      <button className="liked-posts-button" onClick={() => setShowLikedSection(!showLikedSection)}>
      <i className="fa-solid fa-heart"></i>Liked Posts
        </button>
        {showLikedSection && (
          <div className="liked-section">
            <h2>Liked section</h2>
            {addedData.map((item, index) => (
              <div className="art-grid" key={index}>
                <div className="art">
                  <img  loading="lazy" src={item.imageUrl} alt={item.title} />
                  <div className="button-group">
                    <div className="art-details">
                      <h4>{item.title}</h4>
                      <h6>by {item.description}</h6>
                    </div>
                    <button onClick={() => removeDataFromMongoDB(item.imageUrl)}><i className="fas fa-times"></i></button>
                  </div>
                </div>
              </div>
            ))}
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
        {isImageLiked(image.imageUrl) ? (
          <button className='liked' onClick={() => removeDataFromMongoDB(image.imageUrl)}>
            <i className="fas fa-heart"></i>
          </button>
        ) : (
          <button onClick={() => addDataToMongoDB(image)}>
            <i className="fas fa-heart"></i>
          </button>
        )}
      </div>
    </div>
  ))}
</div>
        <div className="categories">
          {Object.keys(subredditCategories)
            .filter((category) => category !== 'custom') // Exclude 'custom' category
            .map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={selectedCategory === category ? 'active' : ''}
              >
                {category}
              </button>
            ))}
        </div>
      </div>
    </>
  );
}

function AuthenticatedApp() {
  return (
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      redirectUri={window.location.origin}
    >
      <App />
    </Auth0Provider>
  );
}

export default AuthenticatedApp;