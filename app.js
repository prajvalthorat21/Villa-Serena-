/* ==========================================================================
   VILLA SERENA — Ultra-Premium Interactive Script (Version 1.0 Final)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Registered Rooms & Specifications
  const ROOMS = [
    { id: 'hero-exterior', folder: 'Hero-Exterior', frames: 80 },
    { id: 'living-room', folder: 'Living-Room', frames: 80 },
    { id: 'kitchen', folder: 'Kitchen', frames: 80 },
    { id: 'master-suite', folder: 'Master-Suite', frames: 80 },
    { id: 'luxury-bathroom', folder: 'Luxury Bathroom', frames: 80 },
    { id: 'pool-garden', folder: 'Pool-Garden', frames: 80 },
    { id: 'final-exterior', folder: 'Final-Exterior', frames: 80 }
  ];

  // Image Cache Store per room
  const roomImages = {};
  ROOMS.forEach(room => {
    roomImages[room.folder] = [];
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  // --------------------------------------------------------------------------
  // 1. Lenis Smooth Scroll Setup (Full Desktop & Mobile Parity)
  // --------------------------------------------------------------------------
  let lenis = null;
  if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: true, // Smooth touch scrubbing on mobile
      touchMultiplier: 1.3,
      wheelMultiplier: 0.95
    });

    lenis.on('scroll', () => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.update();
      }
    });

    gsap.ticker.add((time) => {
      if (lenis) lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  // Register GSAP Plugin
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Helper: Format frame numbers with leading zeros (e.g. 0001)
  function padFrameNumber(num) {
    return String(num).padStart(4, '0');
  }

  // Helper: Get image path for a frame
  function getFramePath(folder, index) {
    const frameNum = padFrameNumber(index + 1);
    return `Scroll-Image-Sequence/${folder}/frame_${frameNum}.webp`;
  }

  // --------------------------------------------------------------------------
  // 2. Mobile-First Preloading & Progressive Image Loader
  // --------------------------------------------------------------------------
  function loadSingleFrame(folder, index) {
    return new Promise((resolve) => {
      if (roomImages[folder] && roomImages[folder][index]) {
        resolve(roomImages[folder][index]);
        return;
      }
      const img = new Image();
      img.onload = () => {
        if (!roomImages[folder]) roomImages[folder] = [];
        roomImages[folder][index] = img;
        resolve(img);
      };
      img.onerror = () => {
        // Fallback to JPG if WEBP fails
        const fallbackImg = new Image();
        const frameNum = padFrameNumber(index + 1);
        fallbackImg.onload = () => {
          if (!roomImages[folder]) roomImages[folder] = [];
          roomImages[folder][index] = fallbackImg;
          resolve(fallbackImg);
        };
        fallbackImg.onerror = () => resolve(null);
        fallbackImg.src = `Scroll-Image-Sequence/${folder}/frame_${frameNum}.jpg`;
      };
      img.src = getFramePath(folder, index);
    });
  }

  // Preload initial priority frames (optimized for quick mobile initial interactivity)
  async function preloadPriorityAssets() {
    const preloaderFill = document.getElementById('preloader-fill');
    const preloaderCounter = document.getElementById('preloader-counter');
    const heroRoom = ROOMS[0];
    const priorityCount = 20;

    let loadedCount = 0;
    const totalPriority = priorityCount + (ROOMS.length - 1) * 5;

    function updateProgress() {
      loadedCount++;
      const percent = Math.min(100, Math.round((loadedCount / totalPriority) * 100));
      if (preloaderFill) preloaderFill.style.width = `${percent}%`;
      if (preloaderCounter) preloaderCounter.textContent = `${percent}%`;
    }

    // Hero priority frames
    const heroPromises = [];
    for (let i = 0; i < priorityCount; i++) {
      heroPromises.push(loadSingleFrame(heroRoom.folder, i).then(updateProgress));
    }

    // Secondary priority frames (first 5 per remaining room)
    const secondaryPromises = [];
    for (let r = 1; r < ROOMS.length; r++) {
      for (let i = 0; i < 5; i++) {
        secondaryPromises.push(loadSingleFrame(ROOMS[r].folder, i).then(updateProgress));
      }
    }

    await Promise.all([...heroPromises, ...secondaryPromises]);

    // Initial render of first frames onto room canvases
    ROOMS.forEach(room => {
      const canvas = document.getElementById(`canvas-${room.id}`);
      if (canvas && roomImages[room.folder] && roomImages[room.folder][0]) {
        renderFrameToCanvas(canvas, roomImages[room.folder][0]);
      }
    });

    // Fade out preloader with luxury 1s reveal sequence
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.style.display = 'none';
        
        // Trigger smooth Hero overlay entrance
        const heroContent = document.querySelector('.hero-content');
        if (heroContent && typeof gsap !== 'undefined') {
          gsap.fromTo(heroContent, 
            { opacity: 0, y: 40 }, 
            { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
          );
        }
      }, 900);
    }

    // Background load remaining frames progressively
    backgroundLoadRemainingFrames();
  }

  // Background loader for remaining frames of all rooms
  async function backgroundLoadRemainingFrames() {
    for (const room of ROOMS) {
      for (let i = 0; i < room.frames; i++) {
        if (!roomImages[room.folder] || !roomImages[room.folder][i]) {
          await loadSingleFrame(room.folder, i);
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // 3. Canvas Sizing & Responsive Cover Aspect Ratio Renderer
  // --------------------------------------------------------------------------
  function renderFrameToCanvas(canvas, img) {
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;

    ctx.clearRect(0, 0, cw, ch);

    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;

    const canvasAspect = cw / ch;
    const imgAspect = iw / ih;

    let renderW, renderH, offsetX, offsetY;

    if (imgAspect > canvasAspect) {
      renderH = ch;
      renderW = ch * imgAspect;
      offsetX = (cw - renderW) / 2;
      offsetY = 0;
    } else {
      renderW = cw;
      renderH = cw / imgAspect;
      offsetX = 0;
      offsetY = (ch - renderH) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  }

  // Resize all room canvases for full viewport fill & high-DPI scaling
  let lastWindowWidth = window.innerWidth;
  function resizeCanvases() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    ROOMS.forEach(room => {
      const canvas = document.getElementById(`canvas-${room.id}`);
      if (canvas) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = '100%';
        canvas.style.height = '100%';
      }
    });

    lastWindowWidth = w;
  }

  window.addEventListener('resize', () => {
    // Prevent canvas redraw flickering when mobile address bar collapses/expands
    if (Math.abs(window.innerWidth - lastWindowWidth) > 10 || !isTouchDevice) {
      resizeCanvases();
    }
  });
  resizeCanvases();

  // --------------------------------------------------------------------------
  // 4. GSAP Pinned Room Scroll-Scrub & Soft Opacity Cross-Fade Setup
  // --------------------------------------------------------------------------
  function initRoomScrollTriggers() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    ROOMS.forEach((room, roomIdx) => {
      const section = document.getElementById(`room-${room.id}`);
      const pinElement = document.getElementById(`pin-${room.id}`) || (section ? section.querySelector('.room-canvas-pin') : null);
      const canvas = document.getElementById(`canvas-${room.id}`);
      const callout = document.getElementById(`callout-${room.id}`);

      if (!section || !pinElement || !canvas) return;

      if (prefersReducedMotion) {
        if (callout) callout.classList.add('is-visible');
        return;
      }

      // ScrollTrigger with PINNING enabled per room section (Full Mobile & Desktop Parity)
      ScrollTrigger.create({
        trigger: section,
        pin: pinElement,
        pinSpacing: false,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.7, // Smooth damping for natural touch & wheel scrubbing
        onUpdate: (self) => {
          const progress = self.progress;
          const frameIndex = Math.min(room.frames - 1, Math.floor(progress * room.frames));
          const img = roomImages[room.folder] ? roomImages[room.folder][frameIndex] : null;

          if (img) {
            renderFrameToCanvas(canvas, img);
          } else {
            loadSingleFrame(room.folder, frameIndex).then((loadedImg) => {
              if (loadedImg) renderFrameToCanvas(canvas, loadedImg);
            });
          }

          // Callout reveal timing
          if (callout) {
            if (progress > 0.10 && progress < 0.90) {
              callout.classList.add('is-visible');
            } else {
              callout.classList.remove('is-visible');
            }
          }

          // Intentional, cinematic cross-fade transition between rooms
          if (progress > 0.88 && roomIdx < ROOMS.length - 1) {
            const fadeOut = 0.20 + 0.80 * ((1.0 - progress) / 0.12);
            canvas.style.opacity = fadeOut.toFixed(2);
          } else if (progress < 0.12 && roomIdx > 0) {
            const fadeIn = 0.20 + 0.80 * (progress / 0.12);
            canvas.style.opacity = fadeIn.toFixed(2);
          } else {
            canvas.style.opacity = '1';
          }
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 5. Entrance Section Reveal Animations (Titles, Cards, Amenities)
  // --------------------------------------------------------------------------
  function initEntranceAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReducedMotion) return;

    // Section Titles & Headers
    const headers = document.querySelectorAll('.section-header, .location-content > div, .about-project-wrapper');
    headers.forEach(header => {
      gsap.fromTo(header,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: header,
            start: 'top 85%'
          }
        }
      );
    });

    // Amenities Grid Stagger Cascade
    const amenityCards = document.querySelectorAll('.amenity-card');
    if (amenityCards.length) {
      gsap.fromTo(amenityCards,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.amenities-grid',
            start: 'top 80%'
          }
        }
      );
    }

    // Gallery Items Cascade Reveal
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length) {
      gsap.fromTo(galleryItems,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.gallery-grid',
            start: 'top 80%'
          }
        }
      );
    }

    // Location Rows Reveal
    const locationRows = document.querySelectorAll('.location-row');
    if (locationRows.length) {
      gsap.fromTo(locationRows,
        { opacity: 0, x: -25 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.location-list',
            start: 'top 85%'
          }
        }
      );
    }
  }

  // --------------------------------------------------------------------------
  // 6. Header & Mobile Navigation Behavior
  // --------------------------------------------------------------------------
  const siteNav = document.getElementById('site-nav');
  const burgerBtn = document.getElementById('burger-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  window.addEventListener('scroll', () => {
    if (!siteNav) return;
    if (window.scrollY > 60) {
      siteNav.classList.add('scrolled');
    } else {
      siteNav.classList.remove('scrolled');
    }
  });

  if (burgerBtn && mobileDrawer) {
    burgerBtn.addEventListener('click', () => {
      const isActive = mobileDrawer.classList.toggle('active');
      burgerBtn.setAttribute('aria-expanded', isActive);
      if (isActive) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    if (mobileLinks && mobileLinks.length) {
      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          mobileDrawer.classList.remove('active');
          burgerBtn.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }
  }

  // --------------------------------------------------------------------------
  // 7. Gallery Motion Video Previews & Lightbox Modal (Touch & Mobile Parity)
  // --------------------------------------------------------------------------
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxVideo = document.getElementById('lightbox-video');
  const lightboxClose = document.getElementById('lightbox-close');

  // Motion video previews on hover (Desktop) and on scroll viewport entry (Mobile)
  if (isTouchDevice && 'IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const item = entry.target;
        const video = item.querySelector('.gallery-motion');
        if (!video) return;

        if (entry.isIntersecting) {
          item.classList.add('playing-video');
          video.currentTime = 0;
          video.play().catch(() => {});
        } else {
          item.classList.remove('playing-video');
          video.pause();
        }
      });
    }, { threshold: 0.45 });

    galleryItems.forEach(item => videoObserver.observe(item));
  } else {
    // Desktop hover handlers
    galleryItems.forEach((item) => {
      const video = item.querySelector('.gallery-motion');
      if (!video) return;

      item.addEventListener('mouseenter', () => {
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      });

      item.addEventListener('mouseleave', () => {
        video.pause();
      });
    });
  }

  // Gallery keyboard accessibility
  galleryItems.forEach(item => {
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  // Lightbox click handler
  if (galleryItems.length && lightbox) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const src = item.getAttribute('data-src');
        const videoSrc = item.getAttribute('data-video');

        if (videoSrc && lightboxVideo) {
          lightboxVideo.src = videoSrc;
          lightboxVideo.style.display = 'block';
          if (lightboxImg) lightboxImg.style.display = 'none';
          lightboxVideo.play().catch(() => {});
        } else if (src && lightboxImg) {
          lightboxImg.src = src;
          lightboxImg.style.display = 'block';
          if (lightboxVideo) {
            lightboxVideo.style.display = 'none';
            lightboxVideo.pause();
          }
        }
        lightbox.classList.add('active');
      });
    });

    function closeLightbox() {
      if (lightbox) lightbox.classList.remove('active');
      if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.src = '';
      }
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) {
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrap')) {
          closeLightbox();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 8. Email Copy & Contact Form Interactions
  // --------------------------------------------------------------------------
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const emailToast = document.getElementById('email-toast');
  const inquiryForm = document.getElementById('inquiry-form');
  const formToast = document.getElementById('form-toast');

  if (copyEmailBtn && emailToast) {
    copyEmailBtn.addEventListener('click', () => {
      const email = 'villaserena@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        emailToast.classList.add('active');
        setTimeout(() => {
          emailToast.classList.remove('active');
        }, 3500);
      }).catch(() => {
        alert('Email: villaserena@gmail.com');
      });
    });
  }

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (formToast) {
        formToast.classList.add('active');
        inquiryForm.reset();
        setTimeout(() => {
          formToast.classList.remove('active');
        }, 6000);
      }
    });
  }

  // Back to Top Smooth Scroll
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo('#hero', { duration: 1.5 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // --------------------------------------------------------------------------
  // 9. Custom Magnetic Cursor
  // --------------------------------------------------------------------------
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');

  if (cursor && follower && !prefersReducedMotion && !isTouchDevice) {
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursor) cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    });

    function renderCursor() {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      if (follower) follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    const hoverables = document.querySelectorAll('a, button, .gallery-item, .amenity-card, .location-row');
    if (hoverables && hoverables.length) {
      hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
      });
    }
  }

  // Initialize Core Engines
  preloadPriorityAssets().then(() => {
    initRoomScrollTriggers();
    initEntranceAnimations();
  });
});
