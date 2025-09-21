import { GALLERY_CONFIG } from '../core/config.js';

/**
 * GSAP Animation Helper Functions
 * Common animation patterns to reduce code duplication
 */
export class AnimationHelpers {
  /**
   * Animate element opacity with standard timing
   * @param {HTMLElement|SVGElement} element - Target element
   * @param {number} targetOpacity - Target opacity value
   * @param {Object} options - Animation options
   */
  static fadeToOpacity(element, targetOpacity, options = {}) {
    const config = {
      opacity: targetOpacity,
      duration: options.duration || GALLERY_CONFIG.animation.modalDuration,
      ease: options.ease || GALLERY_CONFIG.animation.modalEase,
      ...options
    };

    return gsap.to(element, config);
  }

  /**
   * Animate element scale with standard timing
   * @param {HTMLElement} element - Target element
   * @param {number} targetScale - Target scale value
   * @param {Object} options - Animation options
   */
  static scaleToValue(element, targetScale, options = {}) {
    const config = {
      scale: targetScale,
      duration: options.duration || GALLERY_CONFIG.animation.modalDuration,
      ease: options.ease || GALLERY_CONFIG.animation.modalEase,
      ...options
    };

    return gsap.to(element, config);
  }

  /**
   * Animate path stroke width with standard timing
   * @param {SVGPathElement} pathElement - Target path element
   * @param {number} targetWidth - Target stroke width
   * @param {Object} options - Animation options
   */
  static animateStrokeWidth(pathElement, targetWidth, options = {}) {
    const config = {
      strokeWidth: targetWidth,
      duration: options.duration || GALLERY_CONFIG.animation.modalDuration,
      ease: options.ease || GALLERY_CONFIG.animation.modalEase,
      ...options
    };

    return gsap.to(pathElement, config);
  }

  /**
   * Animate path state change (opacity + stroke color)
   * @param {SVGPathElement} pathElement - Target path element
   * @param {Object} state - Target state {opacity, stroke}
   * @param {Object} options - Animation options
   */
  static animatePathState(pathElement, state, options = {}) {
    const config = {
      opacity: state.opacity,
      duration: options.duration || GALLERY_CONFIG.animation.modalDuration,
      ease: options.ease || GALLERY_CONFIG.animation.modalEase,
      ...options
    };

    // Set stroke color immediately (not animated)
    if (state.stroke) {
      pathElement.style.stroke = state.stroke;
    }

    return gsap.to(pathElement, config);
  }

  /**
   * Create hover animation for gallery items
   * @param {HTMLElement} item - Gallery item element
   * @param {HTMLElement} img - Image element within item
   * @param {boolean} isHover - Whether entering or leaving hover
   * @param {Object} options - Animation options
   */
  static animateItemHover(item, img, isHover, options = {}) {
    const targetScale = isHover ? GALLERY_CONFIG.hover.scale : 1;
    const targetFilter = isHover
      ? `brightness(${GALLERY_CONFIG.hover.brightness}) saturate(${GALLERY_CONFIG.hover.saturation})`
      : "brightness(1) saturate(1)";

    const config = {
      duration: options.duration || GALLERY_CONFIG.hover.duration,
      ease: options.ease || GALLERY_CONFIG.hover.ease,
      ...options
    };

    const itemAnimation = gsap.to(item, {
      scale: targetScale,
      ...config
    });

    const imgAnimation = gsap.to(img, {
      filter: targetFilter,
      ...config
    });

    return { itemAnimation, imgAnimation };
  }

  /**
   * Animate path connection highlighting
   * @param {Array} pathElements - Array of path elements to highlight
   * @param {boolean} isHighlight - Whether highlighting or restoring
   * @param {Function} getOpacityFn - Function to get target opacity for each path
   * @param {Object} options - Animation options
   */
  static animateConnectionHighlight(pathElements, isHighlight, getOpacityFn, options = {}) {
    const targetWidth = isHighlight
      ? GALLERY_CONFIG.path.strokeWidth.hover
      : GALLERY_CONFIG.path.strokeWidth.normal;

    const config = {
      strokeWidth: targetWidth,
      duration: options.duration || GALLERY_CONFIG.animation.modalDuration,
      ease: options.ease || GALLERY_CONFIG.animation.modalEase,
      ...options
    };

    return pathElements.map(pathData => {
      const targetOpacity = getOpacityFn(pathData);
      return gsap.to(pathData.element, {
        ...config,
        opacity: targetOpacity
      });
    });
  }

  /**
   * Create timeline for modal animations
   * @param {Object} elements - Modal elements {modal, background, content}
   * @param {boolean} isOpening - Whether opening or closing modal
   * @param {Object} options - Animation options
   */
  static createModalTimeline(elements, isOpening, options = {}) {
    const tl = gsap.timeline();

    if (isOpening) {
      // Modal opening sequence
      tl.to(elements.background, {
        opacity: 1,
        duration: GALLERY_CONFIG.animation.modalDuration,
        ease: GALLERY_CONFIG.animation.modalEase,
        ...options.background
      })
      .to(elements.content, {
        opacity: 1,
        x: '-50%',
        y: '-50%',
        duration: GALLERY_CONFIG.animation.modalDuration,
        ease: GALLERY_CONFIG.animation.modalEase,
        ...options.content
      }, `-=${GALLERY_CONFIG.animation.timelineOffset}`);
    } else {
      // Modal closing sequence
      tl.to(elements.content, {
        scale: 0.5,
        opacity: 0,
        rotation: 10,
        duration: GALLERY_CONFIG.animation.modalDuration,
        ease: "power2.in",
        ...options.content
      })
      .to(elements.background, {
        opacity: 0,
        duration: GALLERY_CONFIG.animation.modalBackgroundDuration,
        ease: "power2.in",
        ...options.background
      }, `-=${GALLERY_CONFIG.animation.timelineOffset}`)
      .set(elements.modal, { display: 'none' });
    }

    return tl;
  }
}