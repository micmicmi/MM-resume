(() => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const imagePaths = [
    "./pic/1c395e19-1659-4db5-8df4-fafbef1d47cb_edit2.jpg",
    "./pic/3fdcbd9b-1bdb-4029-8e93-ee1cd89dc27b_molson1.png",
    "./pic/3cb29f0a-b505-4800-a2f9-b775e8cb3e56_systems2.jpg",
    "./pic/5c5fc1b8-bf90-4890-adfb-75f8fa9b763e_molson3.png",
    "pic/Zend_3Uurf2G3MaO_systems5.jpg",
    "./pic/Zei3I3Uurf2G3LA5_bdi1.jpg",
    "./pic/996e09c5-a10a-4830-b259-ce3b9cde1143_edit3.jpg",
    "./gif/b2c430cc-5915-4c8b-8cf7-9b8f279dc615_nike4 (1).gif",
    "./gif/Zei8rHUurf2G3LCU_escape2.gif",
  ];
  const videoPaths = [
    "./vid/Dribbble_Faria.mp4",
    "./vid/Dominos-Add-To-Cart.mp4",
    "vid/Dominos-Add-Toppimg.mp4",
    "./vid/samsung1.mp4",
    "./vid/edit1.mp4",
    "./vid/unity1.mp4",
    "./vid/spotify2.mp4",
  ];
  
  let images = [];
  let mouseX = 0;
  let mouseY = 0;
  let trails = [];
  let lastRenderTime = 0;
  const renderInterval = 1000 / 60;
  const maxImages = 8;
  let mouseMoveCount = 0; // Counter for mouse movements
  const videoElement = document.createElement('video'); // Create a single video element
  videoElement.autoplay = false; // Set autoplay to false
  videoElement.muted = true; // Optional: Mute the video
  let currentVideoSrc = ''; // Keep track of the currently playing video

  // Add source tags for different video formats
  const sources = [
    { src: "./vid/Dribbble_Faria.mp4", type: "video/mp4" },
    { src: "./vid/Dribbble_Faria.webm", type: "video/webm" }, // Example of a different codec
    { src: "./vid/Dominos-Add-To-Cart.mp4", type: "video/mp4" },
    { src: "./vid/Dominos-Add-To-Cart.webm", type: "video/webm" },
    { src: "./gif/b2c430cc-5915-4c8b-8cf7-9b8f279dc615_nike4 (1).gif",type: "gif" },
    { src: "./gif/Zei8rHUurf2G3LCU_escape2.gif",type: "gif" },
    { src: "./vid/samsung1.mp4", type: "video/mp4" },
    { src: "./vid/edit1.mp4", type: "video/mp4" },
     { src:"./vid/unity1.mp4", type: "video/mp4" },
    { src:  "./vid/spotify2.mp4", type: "video/mp4" },
    // Add more sources as needed
  ];

  sources.forEach(source => {
    const sourceElement = document.createElement('source');
    sourceElement.src = source.src;
    sourceElement.type = source.type;
    videoElement.appendChild(sourceElement);
  });

  const preloadImages = async () => {
    const promises = imagePaths.map(src => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          images.push(img);
          resolve();
        };
        img.onerror = () => {
          console.error("Error loading image:", src);
          resolve(); // Continue even if there is an error
        };
      });
    });
    await Promise.all(promises);
    render();
  };

  const isVideo = (src) => {
    return src.endsWith('.mp4') || src.endsWith('.gif');
  };

  const playVideo = (videoElement, newVideoSrc) => {
    return new Promise((resolve, reject) => {
      videoElement.src = newVideoSrc; // Assign the new source here

      videoElement.addEventListener('loadeddata', () => {
        videoElement.play()
          .then(() => resolve()) // Resolve the promise when play is successful
          .catch(error => {
            console.error("Error playing video:", error);
            reject(error); // Reject if play fails
          });
      });

      videoElement.addEventListener('error', (error) => {
        console.error("Error loading video:", error);
        console.error("Video source:", newVideoSrc); // Log the video source
        reject(error); // Reject if loading fails
      });
    });
  };

  const updateMousePosition = (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    mouseMoveCount++;

    // Add a new trail image every 8 mouse movements
    if (mouseMoveCount % 8 === 0 && trails.length < maxImages) {
      const currentImageIndex = Math.floor(Math.random() * images.length);
      trails.push({
        image: images[currentImageIndex],
        x: mouseX,
        y: mouseY,
        alpha: 1,
        isVideo: isVideo(images[currentImageIndex].src) // Check if it's a video
      });
    }
  };

  const drawTrail = () => {
    const maxWidth = window.innerWidth <= 375 ? 100 : window.innerWidth >= 1920 ? 300 : 200;
    const maxHeight = maxWidth;

    for (let i = 0; i < trails.length; i++) {
      const trail = trails[i];
      const imageWidth = Math.min(trail.image.width * 0.3, maxWidth);
      const imageHeight = Math.min(trail.image.height * 0.3, maxHeight);
      const drawX = trail.x - imageWidth / 2;
      const drawY = trail.y - imageHeight / 2;

      if (trail.isVideo) {
        if (trail.image.src !== currentVideoSrc) { // Compare with the current video source
          currentVideoSrc = trail.image.src; // Update the current video source

          playVideo(videoElement, trail.image.src)
            .then(() => {
              // Video playback started successfully
            })
            .catch(error => {
              console.error("Failed to play video:", error);
              currentVideoSrc = ''; // Reset after failure
            });
        } else if (!videoElement.paused) {
          // Only draw if the video is playing and the source hasn't changed.
          ctx.drawImage(videoElement, drawX, drawY, imageWidth, imageHeight);
        }

      } else {
        ctx.drawImage(trail.image, drawX, drawY, imageWidth, imageHeight);
      }
      trail.alpha -= 0.01;
    }
    trails = trails.filter(trail => trail.alpha > 0); // Filter trails once after drawing
  };

  const render = (timestamp) => {
    if (timestamp - lastRenderTime < renderInterval) {
      requestAnimationFrame(render);
      return;
    }
    lastRenderTime = timestamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTrail();
    requestAnimationFrame(render);
  };

  const handleClick = () => {
    if (trails.length < maxImages) {
      const currentImageIndex = Math.floor(Math.random() * images.length);
      trails.push({
        image: images[currentImageIndex],
        x: mouseX,
        y: mouseY,
        alpha: 1,
        isVideo: isVideo(images[currentImageIndex].src) // Check if it's a video
      });
    } else {
      if (trails.length > 0) {
        trails[0].alpha = 0;
      }
    }
  };

  window.addEventListener('mousemove', updateMousePosition);
  window.addEventListener('click', handleClick);
  preloadImages();
})();
