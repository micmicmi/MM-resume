const canvas = document.getElementById('canvas');
// Load the images from the folder
const images = [];
const imagePaths = [
  'pic/7fb015fe-795e-407b-a96a-4ae409ddaedf_systems3 (1).jpg',
  'pic/3361c977-33f0-437a-aa4c-93cd5475a2ae_spotify1.png'
]; // Fixed path and removed duplicate

let imagesLoaded = 0;
const totalImages = imagePaths.length;

imagePaths.forEach(path => {
  const img = new Image();
  img.src = path;
  img.onload = () => {
    images.push(img);
    imagesLoaded;
    if (imagesLoaded === totalImages) {
      // Start animation once all images are loaded
      canvas.addEventListener('mouseover', startAnimation);
      canvas.addEventListener('mouseout', stopAnimation);
    }
  };
});

// Variables for animation
let currentImageIndex = 0;
let isAnimating = false;
let animationStartTime = 0;
let animationDuration = 2000; // Animation duration in milliseconds

function startAnimation() {
  if (!isAnimating) {
    isAnimating = true;
    animationStartTime = Date.now();
    currentImageIndex = 0;
    displayImage();
  }
}

function stopAnimation() {
  isAnimating = false;
}

// Function to display the image with animation
function displayImage() {
  if (!isAnimating) return;

  const img = images[currentImageIndex];
  const elapsedTime = Date.now() - animationStartTime;
  const progress = elapsedTime / animationDuration;

  // Calculate size and opacity based on progress
  const size = 20  80 * progress;
  const opacity = Math.min(progress, 1); // Ensure opacity does not exceed 1

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = opacity; // Set global alpha for the current frame
  ctx.drawImage(img, (canvas.width - size) / 2, (canvas.height - size) / 2, size, size);

  if (progress < 1) {
    requestAnimationFrame(displayImage);
  } else {
    currentImageIndex = (currentImageIndex  1) % images.length;
    animationStartTime = Date.now(); // Reset start time for next image
    displayImage(); // Call to display the next image
  }
}