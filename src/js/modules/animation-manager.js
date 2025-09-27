import { GALLERY_CONFIG } from '../core/config.js';
import { MathUtils } from '../utils/math-utils.js';
import { AnimationHelpers } from '../utils/animation-helpers.js';
import { DOMUtils } from '../utils/dom-utils.js';

export class AnimationManager {
  constructor() {
    this.setupGSAP();

    // Bind config change handler for external calling
    this._onConfigChange = this._handleConfigChange.bind(this);

    // Cache current configuration
    this._currentConfig = GALLERY_CONFIG.current;
  }

  /**
   * Handle configuration changes (e.g., responsive breakpoint changes)
   * @param {Object} newBreakpoint - New breakpoint configuration
   * @private
   */
  _handleConfigChange(newBreakpoint) {
    console.log('AnimationManager: Configuration changed to', newBreakpoint.name);

    const newConfig = GALLERY_CONFIG.current;

    // Update GSAP settings for new configuration
    this._updateGSAPSettings(newConfig);

    // Reposition all gallery items if needed
    this._repositionGalleryItems();

    // Update cached configuration
    this._currentConfig = newConfig;
  }

  /**
   * Update GSAP settings for current configuration
   * @param {Object} config - Current configuration
   * @private
   */
  _updateGSAPSettings(config) {
    try {
      const galleryContainer = document.querySelector('.gallery-container');
      if (galleryContainer) {
        gsap.set(galleryContainer, {
          perspective: config.perspective
        });
      }

      const galleryItems = document.querySelectorAll('.gallery-item');
      if (galleryItems.length > 0) {
        gsap.set(galleryItems, {
          transformStyle: config.transformStyle
        });
      }

      console.log('AnimationManager: GSAP settings updated for', config.breakpoint);
    } catch (error) {
      console.error('Error updating GSAP settings:', error);
    }
  }

  /**
   * Reposition all gallery items to new responsive positions
   * @private
   */
  _repositionGalleryItems() {
    try {
      const galleryItems = document.querySelectorAll('.gallery-item');
      if (galleryItems.length === 0) return;

      const config = GALLERY_CONFIG.current;
      const totalItems = Math.min(galleryItems.length, config.itemCount);

      console.log('AnimationManager: Repositioning', totalItems, 'items for new layout');

      galleryItems.forEach((item, index) => {
        if (index >= totalItems) {
          // Hide items that exceed the current item count
          gsap.set(item, { opacity: 0, display: 'none' });
          return;
        }

        if (!item) return;

        try {
          // Show item if it was hidden
          gsap.set(item, { opacity: 1, display: 'block' });

          // Calculate new position using current configuration
          const position = MathUtils.getItemElementPosition(index, totalItems);

          // Smoothly animate to new position
          gsap.to(item, {
            x: position.x,
            y: position.y,
            duration: config.animation.duration,
            ease: config.animation.ease,
            delay: index * config.animation.delay * 0.5 // Reduced delay for repositioning
          });
        } catch (repositionError) {
          console.error(`Error repositioning item at index ${index}:`, repositionError);
        }
      });
    } catch (error) {
      console.error('Error repositioning gallery items:', error);
    }
  }

  /**
   * Initialize GSAP settings for 3D perspective
   */
  setupGSAP() {
    try {
      const config = GALLERY_CONFIG.current;

      const galleryContainer = document.querySelector('.gallery-container');
      if (!galleryContainer) {
        console.warn('Gallery container not found - 3D perspective will not be applied');
        return;
      }

      gsap.set(galleryContainer, {
        perspective: config.perspective
      });

      const galleryItems = document.querySelectorAll('.gallery-item');
      if (galleryItems.length === 0) {
        console.warn('No gallery items found - transform style will not be applied');
        return;
      }

      gsap.set(galleryItems, {
        transformStyle: config.transformStyle
      });

      console.log('AnimationManager: GSAP initialized with', config.breakpoint, 'configuration');
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

    const config = GALLERY_CONFIG.current;
    const totalItems = Math.min(galleryItems.length, config.itemCount);

    try {
      let completedAnimations = 0;

      galleryItems.forEach((item, index) => {
        if (index >= totalItems) {
          // Hide items that exceed the current item count
          gsap.set(item, { opacity: 0, display: 'none' });
          return;
        }

        if (!item) {
          console.warn(`Gallery item at index ${index} is null or undefined - skipping animation`);
          return;
        }

        try {
          // Show item if it was hidden
          gsap.set(item, { opacity: 1, display: 'block' });

          // Calculate final position on circle using MathUtils with current configuration
          const position = MathUtils.getItemElementPosition(index, totalItems);
          const finalX = position.x;
          const finalY = position.y;

          gsap.to(item, {
            x: finalX,
            y: finalY,
            scale: 1,
            duration: config.animation.duration,
            delay: index * config.animation.delay,
            ease: config.animation.ease,
            onComplete: () => {
              completedAnimations++;
              if (completedAnimations === totalItems) {
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
      const config = GALLERY_CONFIG.current;
      const centerOffset = config.itemSize / 2;
      const totalItems = Math.min(galleryItems.length, config.itemCount);

      galleryItems.forEach((item, index) => {
        if (index >= totalItems) {
          // Hide items that exceed the current item count
          gsap.set(item, { opacity: 0, display: 'none' });
          return;
        }

        if (!item) {
          console.warn(`Gallery item at index ${index} is null or undefined - skipping initial layout`);
          return;
        }

        try {
          // Show item if it was hidden
          gsap.set(item, { opacity: 1, display: 'block' });

          gsap.set(item, {
            x: config.centerX - centerOffset,
            y: config.centerY - centerOffset,
            rotation: 0,
            scale: 0
          });
        } catch (layoutError) {
          console.error(`Error setting initial layout for item at index ${index}:`, layoutError);
        }
      });

      console.log('AnimationManager: Initial layout set for', totalItems, 'items');
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
      const config = GALLERY_CONFIG.current;
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

      // Animate clicked item with helper using current configuration
      if (clickedItem) {
        try {
          AnimationHelpers.scaleToValue(clickedItem, config.animation.itemClickScale, {
            duration: config.animation.itemClickDuration,
            ease: "power2.inOut",
            onComplete: () => {
              try {
                AnimationHelpers.scaleToValue(clickedItem, 1, {
                  duration: config.animation.itemClickDuration,
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
      const config = GALLERY_CONFIG.current;
      const length = pathElement.getTotalLength();

      gsap.set(pathElement, {
        strokeDasharray: `${length} ${length}`,
        strokeDashoffset: length,
        opacity: config.path.opacity.light // 薄い透明度を設定
      });

      gsap.to(pathElement, {
        strokeDashoffset: 0,
        duration: config.animation.pathStrokeDuration,
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
      const config = GALLERY_CONFIG.current;

      gsap.to(pathElement, {
        opacity: targetState.opacity,
        duration: config.animation.modalDuration,
        ease: config.animation.modalEase
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
      const config = GALLERY_CONFIG.current;
      const targetWidth = isHover ?
        config.path.strokeWidth.hover :
        config.path.strokeWidth.normal;

      AnimationHelpers.animateStrokeWidth(pathElement, targetWidth);
    } catch (error) {
      console.error('Error animating path hover:', error);
    }
  }

  /**
   * Get current animation configuration
   * @returns {Object} Current animation configuration
   */
  getCurrentAnimationConfig() {
    const config = GALLERY_CONFIG.current;
    return {
      ...config.animation,
      breakpoint: config.breakpoint,
      itemSize: config.itemSize,
      perspective: config.perspective
    };
  }

  /**
   * Force refresh animations (useful after manual configuration changes)
   */
  refresh() {
    console.log('AnimationManager: Force refreshing animations');
    this._repositionGalleryItems();
  }

  /**
   * External method to handle configuration changes from GSAPGalleryViewer
   * @param {string} breakpointName - New breakpoint name
   */
  handleConfigChange(breakpointName) {
    this._handleConfigChange({ name: breakpointName });
  }

  /**
   * Cleanup - remove event listeners
   */
  cleanup() {
    // No longer directly managing event listeners
    // GSAPGalleryViewer handles the coordination
    console.log('AnimationManager: Cleanup completed');
  }
}