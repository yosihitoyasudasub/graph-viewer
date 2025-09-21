export const GALLERY_CONFIG = {
  // Gallery dimensions and layout
  radius: 250,
  centerX: 300,
  centerY: 300,
  itemSize: 100,

  // Animation settings
  animation: {
    duration: 0.8,
    delay: 0.1,
    ease: "sine.inOut",
    modalDuration: 0.3,
    modalEase: "power2.out",

    // Specific animation timings
    pathStrokeDelay: 0.2,        // Connection line animation stagger
    pathStrokeDuration: 1.5,     // Path stroke animation duration
    itemClickScale: 0.8,         // Scale when item is clicked
    itemClickDuration: 0.2,      // Click animation duration
    timelineOffset: 0.1,         // Timeline overlap adjustment
    modalBackgroundDuration: 0.2, // Modal background fade duration

    // Page intro animations
    introTitleOffset: -50,       // Title slide offset
    introContainerScale: 0.8,    // Initial container scale
    introContainerDelay: 0.3     // Container animation delay
  },

  // Path and connection settings
  path: {
    strokeWidth: {
      normal: 5,
      hover: 8
    },
    colors: {
      pink: '#ff6b6b',
      green: '#00ff00'
    },
    opacity: {
      normal: 0.8,
      light: 0.15,
      highlight: 1,
      lightHighlight: 0.3
    }
  },

  // Arc calculation constants
  arcHeightRatio: 0.3,
  itemDelayMultiplier: 0.1,

  // 3D perspective settings
  perspective: 1000,
  transformStyle: "preserve-3d",

  // Hover and interaction
  hover: {
    scale: 1.2,
    brightness: 1.2,
    saturation: 1.3,
    duration: 0.3,
    ease: "power2.out"
  }
};

export const PATH_STATES = {
  PINK_SOLID: 0,
  GREEN_SOLID: 1,
  TRANSPARENT: 2
};

export const DOM_SELECTORS = {
  galleryItems: '.gallery-item',
  modal: '#modal',
  modalImage: '#modal-image',
  closeButton: '#close-button',
  modalBackground: '.modal-background',
  connectionSvg: '#connection-svg',
  modalContent: '.modal-content',
  galleryContainer: '.gallery-container'
};