import { GSAPGalleryViewer } from './core/gallery-viewer.js';
import { DOMUtils } from './utils/dom-utils.js';

// Initialize gallery when DOM is ready
DOMUtils.waitForDOM().then(() => {
  try {
    const gallery = new GSAPGalleryViewer();

    // Add initial page animations
    gsap.from('h1', {
      y: -50,
      opacity: 0,
      duration: 1,
      ease: "power2.out"
    });

    gsap.from('.gallery-container', {
      scale: 0.8,
      opacity: 0,
      duration: 1,
      delay: 0.3,
      ease: "power2.out"
    });

    // Make gallery instance available globally for debugging
    window.gallery = gallery;

    console.log('Gallery initialized successfully');
    console.log('Gallery stats:', gallery.getStats());

  } catch (error) {
    console.error('Failed to initialize gallery:', error);
  }
});