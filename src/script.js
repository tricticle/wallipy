const subredditForm = document.getElementById("subredditForm");
const subredditInput = document.getElementById("subredditInput");
const art = document.querySelector(".art");
const saveArtButton = document.getElementById("saveArtButton");

let imageUrls = [];
let currentImageIndex = 0;

subredditForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const subreddit = subredditInput.value;
  const apiUrl = `https://www.reddit.com/r/${subreddit}/hot.json`;

  // Fetch data from Reddit API
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // Filter URLs of images
      imageUrls = data.data.children
        .filter(post => post.data.post_hint === "image")
        .map(post => post.data.url);

      // Set the first image as the background
      setCurrentImageIndex(0);
    })
    .catch(error => console.error(error));
});

art.addEventListener("click", function(event) {
  const screenWidth = window.innerWidth;
  const clickX = event.clientX;
  const artWidth = art.offsetWidth;

  if (clickX < artWidth / 2) {
    // Clicked on the left side of the art element, go to previous image
    setCurrentImageIndex(currentImageIndex - 1);
  } else {
    // Clicked on the right side of the art element, go to next image
    setCurrentImageIndex(currentImageIndex + 1);
  }
});

saveArtButton.addEventListener("click", function() {
  // Download the current image
  const imageUrl = imageUrls[currentImageIndex];
  const a = document.createElement("a");
  a.href = imageUrl;
  a.download = "art.jpg";
  a.click();
});

function setCurrentImageIndex(newIndex) {
  // Make sure the index stays within the bounds of the imageUrls array
  currentImageIndex = (newIndex + imageUrls.length) % imageUrls.length;

  // Set the current image as the background
  art.style.backgroundImage = `url(${imageUrls[currentImageIndex]})`;
} 