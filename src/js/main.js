import { GSAPGalleryViewer } from './core/gallery-viewer.js';
import { DOMUtils } from './utils/dom-utils.js';
import { GALLERY_CONFIG } from './core/config.js';
import { SystemValidator } from './utils/system-validator.js';

// Initialize gallery when DOM is ready
DOMUtils.waitForDOM().then(() => {
  let gallery = null;

  try {
    // Check if GSAP is available
    if (typeof gsap === 'undefined') {
      throw new Error('GSAP library not loaded');
    }

    gallery = new GSAPGalleryViewer();

    // Only run intro animations if gallery initialized successfully
    if (gallery.isReady()) {
      // Add initial page animations
      try {
        gsap.from('h1', {
          y: GALLERY_CONFIG.animation.introTitleOffset,
          opacity: 0,
          duration: 1,
          ease: "power2.out"
        });

        gsap.from('.gallery-container', {
          scale: GALLERY_CONFIG.animation.introContainerScale,
          opacity: 0,
          duration: 1,
          delay: GALLERY_CONFIG.animation.introContainerDelay,
          ease: "power2.out"
        });
      } catch (animError) {
        console.warn('Intro animations failed, but gallery is functional:', animError);
      }

      console.log('Gallery initialized successfully');
      console.log('Gallery stats:', gallery.getStats());

      // Run system validation in development mode
      setTimeout(async () => {
        try {
          const validator = new SystemValidator();
          const results = await validator.runValidation();
          console.log('=== SYSTEM VALIDATION RESULTS ===');
          console.log(validator.generateReport());

          if (results.status === 'ALL_TESTS_PASSED') {
            console.log('✅ All Phase 3 integration tests passed!');
          } else {
            console.warn('⚠️ Some integration tests failed - check details above');
          }
        } catch (validationError) {
          console.error('System validation failed:', validationError);
        }
      }, 2000); // Run after initial animations complete

    } else {
      console.warn('Gallery initialized with errors - some features may not work');
    }

    // Make gallery instance available globally for debugging
    window.gallery = gallery;

  } catch (error) {
    console.error('Failed to initialize gallery:', error);

    // Show generic fallback if gallery creation completely failed
    if (!gallery || !gallery.isReady()) {
      showGenericFallback(error);
    }
  }
}).catch(domError => {
  console.error('DOM initialization failed:', domError);
  showGenericFallback(domError);
});

/**
 * Show generic fallback when everything fails
 * @param {Error} error - The error that occurred
 */
function showGenericFallback(error) {
  try {
    const body = document.body;
    if (body) {
      const fallbackDiv = document.createElement('div');
      fallbackDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        padding: 40px;
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        color: #333;
        max-width: 400px;
        z-index: 9999;
      `;
      fallbackDiv.innerHTML = `
        <h2>Gallery Unavailable</h2>
        <p>The interactive gallery could not be loaded.</p>
        <p style="font-size: 14px; color: #666;">
          Error: ${error.message}
        </p>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">
          Please check the browser console for detailed error information.
        </p>
      `;
      body.appendChild(fallbackDiv);
    }
  } catch (fallbackError) {
    console.error('Even fallback display failed:', fallbackError);
    alert('Gallery failed to load. Please check the console for details.');
  }
}