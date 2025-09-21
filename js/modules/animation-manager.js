import { GALLERY_CONFIG } from '../core/config.js';

export class AnimationManager {
  constructor() {
    this.setupGSAP();
  }

  /**
   * Initialize GSAP settings for 3D perspective
   */
  setupGSAP() {
    gsap.set('.gallery-container', {
      perspective: GALLERY_CONFIG.perspective
    });

    gsap.set('.gallery-item', {
      transformStyle: GALLERY_CONFIG.transformStyle
    });
  }

  /**
   * Set transform origin for gallery items
   * @param {NodeList} galleryItems - Gallery item elements
   */
  setTransformOrigins(galleryItems) {
    galleryItems.forEach((item) => {
      gsap.set(item, {
        transformOrigin: "center center"
      });
    });
  }

  /**
   * Animate gallery items in circular layout
   * @param {NodeList} galleryItems - Gallery item elements
   * @param {Function} onCompleteCallback - Callback for animation completion
   */
  animateGalleryItems(galleryItems, onCompleteCallback) {
    const totalItems = galleryItems.length;

    galleryItems.forEach((item, index) => {
      // Calculate final position on circle
      const angle = (index / totalItems) * Math.PI * 2;
      const finalX = GALLERY_CONFIG.centerX + GALLERY_CONFIG.radius * Math.cos(angle) - 50;
      const finalY = GALLERY_CONFIG.centerY + GALLERY_CONFIG.radius * Math.sin(angle) - 50;

      gsap.to(item, {
        x: finalX,
        y: finalY,
        scale: 1,
        duration: GALLERY_CONFIG.animation.duration,
        delay: index * GALLERY_CONFIG.animation.delay,
        ease: GALLERY_CONFIG.animation.ease,
        onComplete: () => {
          if (index === galleryItems.length - 1) {
            onCompleteCallback();
          }
        }
      });
    });
  }

  /**
   * Setup initial circular layout positions
   * @param {NodeList} galleryItems - Gallery item elements
   */
  setupInitialLayout(galleryItems) {
    galleryItems.forEach((item) => {
      gsap.set(item, {
        x: GALLERY_CONFIG.centerX - 50,
        y: GALLERY_CONFIG.centerY - 50,
        rotation: 0,
        scale: 0
      });
    });
  }

  /**
   * Add hover animation to gallery item
   * @param {HTMLElement} item - Gallery item element
   * @param {number} index - Item index
   * @param {Function} onMouseEnter - Mouse enter callback
   * @param {Function} onMouseLeave - Mouse leave callback
   */
  addHoverAnimation(item, index, onMouseEnter, onMouseLeave) {
    const img = item.querySelector('img');

    item.addEventListener('mouseenter', () => {
      gsap.to(item, {
        scale: GALLERY_CONFIG.hover.scale,
        duration: GALLERY_CONFIG.animation.modalDuration,
        ease: GALLERY_CONFIG.animation.modalEase
      });

      gsap.to(img, {
        filter: `brightness(${GALLERY_CONFIG.hover.brightness}) saturate(${GALLERY_CONFIG.hover.saturation})`,
        duration: GALLERY_CONFIG.animation.modalDuration
      });

      if (onMouseEnter) onMouseEnter(index);
    });

    item.addEventListener('mouseleave', () => {
      gsap.to(item, {
        scale: 1,
        duration: GALLERY_CONFIG.animation.modalDuration,
        ease: GALLERY_CONFIG.animation.modalEase
      });

      gsap.to(img, {
        filter: "brightness(1) saturate(1)",
        duration: GALLERY_CONFIG.animation.modalDuration
      });

      if (onMouseLeave) onMouseLeave(index);
    });
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
    modalImage.src = imageUrl;

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

    const tl = gsap.timeline();

    tl.to(modalBackground, {
      opacity: 1,
      duration: GALLERY_CONFIG.animation.modalDuration,
      ease: GALLERY_CONFIG.animation.modalEase
    })
    .to('.modal-content', {
      opacity: 1,
      x: '-50%',
      y: '-50%',
      duration: GALLERY_CONFIG.animation.modalDuration,
      ease: GALLERY_CONFIG.animation.modalEase
    }, "-=0.1");

    // Animate clicked item
    gsap.to(clickedItem, {
      scale: 0.8,
      duration: 0.2,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.to(clickedItem, {
          scale: 1,
          duration: 0.2,
          ease: "power2.out"
        });
      }
    });
  }

  /**
   * Close modal with animation
   * @param {HTMLElement} modal - Modal element
   * @param {HTMLElement} modalBackground - Modal background element
   */
  closeModal(modal, modalBackground) {
    const tl = gsap.timeline();

    tl.to('.modal-content', {
      scale: 0.5,
      opacity: 0,
      rotation: 10,
      duration: GALLERY_CONFIG.animation.modalDuration,
      ease: "power2.in"
    })
    .to(modalBackground, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.in"
    }, "-=0.1")
    .set(modal, { display: 'none' });
  }

  /**
   * Animate path stroke dash
   * @param {SVGPathElement} pathElement - Path element
   * @param {number} delay - Animation delay
   */
  animatePathStroke(pathElement, delay = 0) {
    const length = pathElement.getTotalLength();

    gsap.set(pathElement, {
      strokeDasharray: `${length} ${length}`,
      strokeDashoffset: length
    });

    gsap.to(pathElement, {
      strokeDashoffset: 0,
      duration: 1.5,
      ease: "power2.out",
      delay: 0.5 + delay
    });
  }

  /**
   * Animate path state change
   * @param {SVGPathElement} pathElement - Path element
   * @param {Object} targetState - Target visual state
   */
  animatePathState(pathElement, targetState) {
    gsap.to(pathElement, {
      opacity: targetState.opacity,
      duration: GALLERY_CONFIG.animation.modalDuration,
      ease: GALLERY_CONFIG.animation.modalEase
    });
  }

  /**
   * Animate path hover effect
   * @param {SVGPathElement} pathElement - Path element
   * @param {boolean} isHover - Whether hovering
   */
  animatePathHover(pathElement, isHover) {
    const targetWidth = isHover ?
      GALLERY_CONFIG.path.strokeWidth.hover :
      GALLERY_CONFIG.path.strokeWidth.normal;

    gsap.to(pathElement, {
      strokeWidth: targetWidth,
      duration: GALLERY_CONFIG.animation.modalDuration,
      ease: GALLERY_CONFIG.animation.modalEase
    });
  }
}