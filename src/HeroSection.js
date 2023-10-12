import React, { useState, useEffect } from "react";

function HeroSection({ likedImages }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

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
  }, [likedImages]);

  return (
    <section
      className="container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleHeroClick} // Click anywhere in the HeroSection to change images
    >
      <div className="cur-sec">
        <div className="cur-flex">
          <div className="cur-art">
            {likedImages.length > 0 && (
              <img
                src={likedImages[currentImageIndex].imageUrl}
                alt={likedImages[currentImageIndex].title}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
