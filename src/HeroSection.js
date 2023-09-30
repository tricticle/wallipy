import React, { useState, useEffect } from "react";

function HeroSection({ likedImages }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % likedImages.length);
    }, 7000); // Change image every 7 seconds

    return () => {
      clearInterval(intervalId); // Clean up the interval when the component unmounts
    };
  }, [likedImages]);

  return (
    <section className="container">
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
