import { GALLERY_CONFIG } from '../core/config.js';
import { MathUtils } from '../utils/math-utils.js';
import { AnimationHelpers } from '../utils/animation-helpers.js';
import { DOMUtils } from '../utils/dom-utils.js';

export class AnimationManager {
  constructor() {
    this.setupGSAP();
  }

  /**
   * Initialize GSAP settings for 3D perspective
   */
  setupGSAP() {
    try {
      const galleryContainer = document.querySelector('.gallery-container');
      if (!galleryContainer) {
        console.warn('Gallery container not found - 3D perspective will not be applied');
        return;
      }

      gsap.set('.gallery-container', {
        perspective: GALLERY_CONFIG.perspective
      });

      const galleryItems = document.querySelectorAll('.gallery-item');
      if (galleryItems.length === 0) {
        console.warn('No gallery items found - transform style will not be applied');
        return;
      }

      gsap.set('.gallery-item', {
        transformStyle: GALLERY_CONFIG.transformStyle
      });
    } catch (error) {
      console.error('Error setting up GSAP initial configuration:', error);
    }
  }

  /**
   * Set transform origin for gallery items
   * @param {NodeList} galleryItems - Gallery item elements
   */
  setTransformOrigins(galleryItems) {
    if (!galleryItems || galleryItems.length === 0) {
      console.warn('No gallery items provided for transform origin setup');
      return;
    }

    try {
      galleryItems.forEach((item, index) => {
        if (!item) {
          console.warn(`Gallery item at index ${index} is null or undefined`);
          return;
        }

        gsap.set(item, {
          transformOrigin: "center center"
        });
      });
    } catch (error) {
      console.error('Error setting transform origins:', error);
    }
  }

  /**
   * Animate gallery items in circular layout
   * @param {NodeList} galleryItems - Gallery item elements
   * @param {Function} onCompleteCallback - Callback for animation completion
   */
  animateGalleryItems(galleryItems, onCompleteCallback) {
    if (!galleryItems || galleryItems.length === 0) {
      console.warn('No gallery items provided for animation');
      if (typeof onCompleteCallback === 'function') {
        onCompleteCallback();
      }
      return;
    }

    const totalItems = galleryItems.length;

    try {
      galleryItems.forEach((item, index) => {
        if (!item) {
          console.warn(`Gallery item at index ${index} is null or undefined - skipping animation`);
          return;
        }

        try {
          // Calculate final position on circle using MathUtils
          const position = MathUtils.getItemElementPosition(index, totalItems);
          const finalX = position.x;
          const finalY = position.y;

          gsap.to(item, {
            x: finalX,
            y: finalY,
            scale: 1,
            duration: GALLERY_CONFIG.animation.duration,
            delay: index * GALLERY_CONFIG.animation.delay,
            ease: GALLERY_CONFIG.animation.ease,
            onComplete: () => {
              if (index === galleryItems.length - 1) {
                if (typeof onCompleteCallback === 'function') {
                  onCompleteCallback();
                } else {
                  console.warn('onCompleteCallback is not a function');
                }
              }
            }
          });
        } catch (animationError) {
          console.error(`Error animating gallery item at index ${index}:`, animationError);
        }
      });
    } catch (error) {
      console.error('Error in gallery items animation:', error);
      if (typeof onCompleteCallback === 'function') {
        onCompleteCallback();
      }
    }
  }

  /**
   * Setup initial circular layout positions
   * @param {NodeList} galleryItems - Gallery item elements
   */
  setupInitialLayout(galleryItems) {
    if (!galleryItems || galleryItems.length === 0) {
      console.warn('No gallery items provided for initial layout setup');
      return;
    }

    try {
      const centerOffset = GALLERY_CONFIG.itemSize / 2;
      galleryItems.forEach((item, index) => {
        if (!item) {
          console.warn(`Gallery item at index ${index} is null or undefined - skipping initial layout`);
          return;
        }

        try {
          gsap.set(item, {
            x: GALLERY_CONFIG.centerX - centerOffset,
            y: GALLERY_CONFIG.centerY - centerOffset,
            rotation: 0,
            scale: 0
          });
        } catch (layoutError) {
          console.error(`Error setting initial layout for item at index ${index}:`, layoutError);
        }
      });
    } catch (error) {
      console.error('Error in initial layout setup:', error);
    }
  }

  /**
   * Execute hover animation for gallery item (called by EventManager)
   * @param {HTMLElement} item - Gallery item element
   * @param {boolean} isHover - Whether entering or leaving hover
   */
  executeHoverAnimation(item, isHover) {
    if (!item) {
      console.warn('Gallery item not provided for hover animation');
      return;
    }

    const img = DOMUtils.querySelector('img', item);
    if (!img) {
      console.warn('Image not found in gallery item for hover animation');
      return;
    }

    try {
      AnimationHelpers.animateItemHover(item, img, isHover);
    } catch (error) {
      console.error('Error executing hover animation:', error);
    }
  }

  /**
   * Open modal with animation
   * @param {HTMLElement} modal - Modal element
   * @param {HTMLElement} modalBackground - Modal background element
   * @param {HTMLElement} modalImage - Modal image element
   * @param {HTMLElement} clickedItem - Clicked gallery item
   * @param {string} imageUrl - Image URL to display
   */
  openModal(modal, modalBackground, modalImage, clickedItem, imageUrl) {
    if (!modal || !modalBackground || !modalImage) {
      console.error('Modal elements not provided or found');
      return;
    }

    if (!imageUrl) {
      console.warn('No image URL provided for modal');
      return;
    }

    try {
      modalImage.src = imageUrl;

      // Verify modal content element exists
      const modalContent = document.querySelector('.modal-content');
      if (!modalContent) {
        console.error('Modal content element not found');
        return;
      }

      gsap.set(modal, { display: 'block' });
      gsap.set(modalBackground, { opacity: 0 });
      gsap.set('.modal-content', {
        opacity: 0,
        scale: 1,
        rotation: 0,
        x: '-50%',
        y: '-50%',
        xPercent: 0,
        yPercent: 0
      });

      // Use AnimationHelpers for modal timeline
      const elements = {
        modal,
        background: modalBackground,
        content: '.modal-content'
      };

      try {
        AnimationHelpers.createModalTimeline(elements, true);
      } catch (timelineError) {
        console.error('Error creating modal timeline:', timelineError);
        // Fallback: just show modal without animation
        modal.style.display = 'block';
        modalBackground.style.opacity = '1';
        modalContent.style.opacity = '1';
      }

      // Animate clicked item with helper
      if (clickedItem) {
        try {
          AnimationHelpers.scaleToValue(clickedItem, GALLERY_CONFIG.animation.itemClickScale, {
            duration: GALLERY_CONFIG.animation.itemClickDuration,
            ease: "power2.inOut",
            onComplete: () => {
              try {
                AnimationHelpers.scaleToValue(clickedItem, 1, {
                  duration: GALLERY_CONFIG.animation.itemClickDuration,
                  ease: "power2.out"
                });
              } catch (scaleBackError) {
                console.error('Error scaling item back:', scaleBackError);
              }
            }
          });
        } catch (scaleError) {
          console.error('Error scaling clicked item:', scaleError);
        }
      }
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }

  /**
   * Close modal with animation
   * @param {HTMLElement} modal - Modal element
   * @param {HTMLElement} modalBackground - Modal background element
   */
  closeModal(modal, modalBackground) {
    if (!modal || !modalBackground) {
      console.error('Modal elements not provided for closing');
      return;
    }

    try {
      const modalContent = document.querySelector('.modal-content');
      if (!modalContent) {
        console.warn('Modal content not found - closing without animation');
        modal.style.display = 'none';
        return;
      }

      const elements = {
        modal,
        background: modalBackground,
        content: '.modal-content'
      };

      try {
        AnimationHelpers.createModalTimeline(elements, false);
      } catch (timelineError) {
        console.error('Error creating modal close timeline:', timelineError);
        // Fallback: just hide modal
        modal.style.display = 'none';
      }
    } catch (error) {
      console.error('Error closing modal:', error);
      // Fallback: force close
      modal.style.display = 'none';
    }
  }

  /**
   * Animate path stroke dash
   * @param {SVGPathElement} pathElement - Path element
   * @param {number} delay - Animation delay
   */
  animatePathStroke(pathElement, delay = 0) {
    if (!pathElement) {
      console.warn('Path element not provided for stroke animation');
      return;
    }

    try {
      const length = pathElement.getTotalLength();

      gsap.set(pathElement, {
        strokeDasharray: `${length} ${length}`,
        strokeDashoffset: length,
        opacity: GALLERY_CONFIG.path.opacity.light // 薄い透明度を設定
      });

      gsap.to(pathElement, {
        strokeDashoffset: 0,
        duration: GALLERY_CONFIG.animation.pathStrokeDuration,
        ease: "power2.out",
        delay: 0.5 + delay
      });
    } catch (error) {
      console.error('Error animating path stroke:', error);
    }
  }

  /**
   * Animate path state change
   * @param {SVGPathElement} pathElement - Path element
   * @param {Object} targetState - Target visual state
   */
  animatePathState(pathElement, targetState) {
    if (!pathElement) {
      console.warn('Path element not provided for state animation');
      return;
    }

    if (!targetState || typeof targetState.opacity === 'undefined') {
      console.warn('Invalid target state provided for path animation');
      return;
    }

    try {
      gsap.to(pathElement, {
        opacity: targetState.opacity,
        duration: GALLERY_CONFIG.animation.modalDuration,
        ease: GALLERY_CONFIG.animation.modalEase
      });
    } catch (error) {
      console.error('Error animating path state:', error);
    }
  }

  /**
   * Animate path hover effect
   * @param {SVGPathElement} pathElement - Path element
   * @param {boolean} isHover - Whether hovering
   */
  animatePathHover(pathElement, isHover) {
    if (!pathElement) {
      console.warn('Path element not provided for hover animation');
      return;
    }

    try {
      const targetWidth = isHover ?
        GALLERY_CONFIG.path.strokeWidth.hover :
        GALLERY_CONFIG.path.strokeWidth.normal;

      AnimationHelpers.animateStrokeWidth(pathElement, targetWidth);
    } catch (error) {
      console.error('Error animating path hover:', error);
    }
  }
}