(() => {
  let videos = [];
  let images = [];
  let canvas, ctx;
  let mouseX = 0;
  let mouseY = 0;
  let trails = [];
  let lastRenderTime = 0;
  let isDragging = false;
  let draggedTrail = null;
  let offsetX = 0;
  let offsetY = 0;
  let animationEnabled = true;
  const renderInterval = 500 / 60; // 60 FPS
  const maxImages = 10;

  // Video and image paths (VERIFIED)
  const videoPaths = [
    "./vid/Dominos-Add-To-Cart.mp4",
    "./vid/Dominos-Add-Toppimg.mp4",
    "./vid/Dominos-Meal-Order-Sequence-1.mp4",
    "./vid/Dribbble_Faria.mp4",
    "./vid/edit1.mp4",
    "./vid/samsung1.mp4",
    "./vid/spotify2.mp4",
    "./vid/unity1.mp4",
    "./mm works- img/1.mp4",
    "./mm works- img/3.mp4",
    "./mm works- img/bestie-show.mp4",
    "./mm works- img/small_02.mp4",
    "./mm works- img/small_04.mp4"
  ];

  const imagePaths = [
    "./mm works- img-2/acacia3.png",
    "./mm works- img-2/bestie (1).PNG",
    "./mm works- img-2/bestie (2).PNG",
    "./mm works- img-2/bestie (3).PNG",
    "./mm works- img-2/bestie (4).PNG",
    "./mm works- img-2/bestie (5).PNG",
    "./mm works- img-2/bestie_1.png",
    "./mm works- img-2/acacia.png",
    "./mm works- img-2/B_2-1.png",
    "./mm works- img-2/B_2-2.png",
    "./mm works- img-2/B_2-3-1.png",
    "./mm works- img-2/B_3.png",
    "./mm works- img/01.webp",
    "./mm works- img/09.webp",
    "./mm works- img/pershute in the wind.gif",
    "./mm works- img/small_01.webp",
    "./mm works- img/small_03.webp",
    "./mm works- img/small_05.webp",
    "./mm works- img/small_06.webp",
    "./mm works- img/small_09.webp"
  ];

  document.addEventListener("DOMContentLoaded", async () => {
    setupCanvas();
    await preloadAssets();
    setupToggleButton();
    setupEventListeners();
    requestAnimationFrame(render);
  });

  const setupCanvas = () => {
    canvas = document.getElementById('canvas');
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }
    // Full-screen fixed canvas covering the entire viewport
    Object.assign(canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'auto',
      zIndex: '9998'
    });
    ctx = canvas.getContext("2d");
    resizeCanvas();
  };

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  // Floating toggle button
  const setupToggleButton = () => {
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'anim-toggle-btn';
    toggleBtn.innerHTML = '✦ Animation: ON';
    Object.assign(toggleBtn.style, {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      zIndex: '10001',
      padding: '12px 24px',
      background: '#111',
      color: '#fff',
      border: 'none',
      borderRadius: '50px',
      fontSize: '0.85rem',
      fontWeight: '600',
      cursor: 'pointer',
      letterSpacing: '0.05em',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit'
    });
    // Prevent mousedown from reaching the canvas drag/drop logic
    toggleBtn.addEventListener('mousedown', (e) => e.stopPropagation());
    toggleBtn.addEventListener('click', () => {
      animationEnabled = !animationEnabled;
      toggleBtn.innerHTML = animationEnabled ? '✦ Animation: ON' : '✦ Animation: OFF';
      toggleBtn.style.background = animationEnabled ? '#111' : '#666';
      if (!animationEnabled) {
        trails = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
    document.body.appendChild(toggleBtn);
  };

  // Create a loading screen
  const createLoadingScreen = () => {
    const loadingScreen = document.createElement("div");
    Object.assign(loadingScreen.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      color: "black",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "2em",
      fontFamily: "inherit",
      zIndex: "9999"
    });
    loadingScreen.textContent = "Loading... 0%";
    document.body.appendChild(loadingScreen);
    return loadingScreen;
  };

  const preloadAsset = (src, isVideo) => {
    return new Promise((resolve) => {
      const asset = isVideo ? document.createElement('video') : new Image();

      if (isVideo) {
        // Remove crossOrigin as it can block local video files
        asset.muted = true;
        asset.loop = true;
        asset.playsInline = true;
        asset.preload = 'auto';

        asset.oncanplay = () => {
          videos.push({
            element: asset,
            src,
            width: asset.videoWidth || 300,
            height: asset.videoHeight || 200
          });
          resolve(asset);
        };
      } else {
        asset.onload = () => {
          images.push({
            element: asset,
            src,
            width: asset.width,
            height: asset.height
          });
          resolve(asset);
        };
      }

      asset.onerror = () => {
        console.warn(`Skipping missing asset: ${src}`);
        resolve(null);
      };

      asset.src = src;
      if (isVideo) asset.load();
    });
  };

  const preloadAssets = async () => {
    const loadingScreen = createLoadingScreen();
    try {
      await Promise.all([
        ...videoPaths.map(src => preloadAsset(src, true)),
        ...imagePaths.map(src => preloadAsset(src, false))
      ]);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      document.body.removeChild(loadingScreen);
    }
  };

  const createTrail = (x, y, isVideo = false) => {
    const assetArray = isVideo ? videos : images;
    if (assetArray.length === 0 || !animationEnabled) return null;

    const asset = assetArray[Math.floor(Math.random() * assetArray.length)];
    if (isVideo && asset.element) {
      // Reset and play the video
      asset.element.currentTime = 0;
      asset.element.play().catch(err => console.warn('Video play failed:', err));
    }

    return {
      asset,
      x,
      y,
      alpha: 1,
      scale: 0.65,
      isVideo
    };
  };

  const drawTrail = () => {
    if (!ctx) return;

    const maxWidth = window.innerWidth <= 375 ? 100 : window.innerWidth >= 1920 ? 300 : 200;

    trails = trails.filter(trail => {
      if (!trail || !trail.asset || trail.alpha <= 0) return false;

      const asset = trail.asset;
      const displayWidth = Math.min(asset.width * 0.3, maxWidth) * trail.scale;
      const aspectRatio = asset.width / asset.height;
      const displayHeight = displayWidth / aspectRatio;
      const drawX = trail.x - displayWidth / 2;
      const drawY = trail.y - displayHeight / 2;

      try {
        if (trail.isVideo && trail.asset.element) {
          const video = trail.asset.element;
          if (video.paused) {
            video.play().catch(err => console.warn('Video play failed:', err));
          }
          ctx.drawImage(video, drawX, drawY, displayWidth, displayHeight);
        } else if (!trail.isVideo && trail.asset.element) {
          ctx.drawImage(trail.asset.element, drawX, drawY, displayWidth, displayHeight);
        }
      } catch (error) {
        console.warn('Error drawing asset:', error);
        return false;
      }

      trail.scale = Math.min(trail.scale + 0.05, 1);
      trail.alpha -= 0.01; // Slowed down the fade out

      return true;
    });
  };

  const render = (timestamp) => {
    if (!ctx) return;

    if (timestamp - lastRenderTime >= renderInterval) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (animationEnabled) drawTrail();
      lastRenderTime = timestamp;
    }

    requestAnimationFrame(render);
  };

  const setupEventListeners = () => {
    let mouseMoveCount = 0;

    const handleMouseMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      mouseMoveCount++;
      if (mouseMoveCount % 10 === 0 && trails.length < maxImages) {
        const isVideo = Math.random() < 0.3;
        const trail = createTrail(mouseX, mouseY, isVideo);
        if (trail) trails.push(trail);
      }

      if (isDragging && draggedTrail) {
        draggedTrail.x = mouseX - offsetX;
        draggedTrail.y = mouseY - offsetY;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    canvas.addEventListener("click", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      const isVideo = Math.random() < 0.3;
      const trail = createTrail(mouseX, mouseY, isVideo);
      if (trail) trails.push(trail);
    });

    canvas.addEventListener("mousedown", (event) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;

      for (const trail of trails) {
        const displayWidth = Math.min(trail.asset.width * 0.3, 200) * trail.scale;
        const aspectRatio = trail.asset.width / trail.asset.height;
        const displayHeight = displayWidth / aspectRatio;

        const drawX = trail.x - displayWidth / 2;
        const drawY = trail.y - displayHeight / 2;

        if (mouseX >= drawX && mouseX <= drawX + displayWidth &&
            mouseY >= drawY && mouseY <= drawY + displayHeight) {
          isDragging = true;
          draggedTrail = trail;
          offsetX = mouseX - trail.x;
          offsetY = mouseY - trail.y;
          break;
        }
      }
    });

    canvas.addEventListener("mouseup", () => {
      isDragging = false;
      draggedTrail = null;
    });

    canvas.addEventListener("mouseleave", () => {
      isDragging = false;
      draggedTrail = null;
    });

    window.addEventListener("resize", resizeCanvas);
  };
})();