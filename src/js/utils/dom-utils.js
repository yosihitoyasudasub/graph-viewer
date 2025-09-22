import { DOM_SELECTORS, GALLERY_CONFIG } from '../core/config.js';

export class DOMUtils {
  /**
   * Safely query a single element
   * @param {string} selector - CSS selector
   * @param {HTMLElement} parent - Parent element (optional)
   * @returns {HTMLElement|null} Found element or null
   */
  static querySelector(selector, parent = document) {
    try {
      return parent.querySelector(selector);
    } catch (error) {
      console.error(`Error querying selector "${selector}":`, error);
      return null;
    }
  }

  /**
   * Safely query multiple elements
   * @param {string} selector - CSS selector
   * @param {HTMLElement} parent - Parent element (optional)
   * @returns {NodeList} Found elements
   */
  static querySelectorAll(selector, parent = document) {
    try {
      return parent.querySelectorAll(selector);
    } catch (error) {
      console.error(`Error querying selector "${selector}":`, error);
      return [];
    }
  }

  /**
   * Generate gallery items dynamically based on config
   */
  static generateGalleryItems() {
    const galleryCircle = this.querySelector(DOM_SELECTORS.galleryCircle);
    if (!galleryCircle) {
      throw new Error('Gallery circle container not found');
    }

    // Clear existing items
    galleryCircle.innerHTML = '';

    // Generate items based on config
    for (let i = 0; i < GALLERY_CONFIG.itemCount; i++) {
      const itemData = GALLERY_CONFIG.itemData[i];
      if (!itemData) {
        console.warn(`No data found for item ${i}, using fallback`);
        continue;
      }

      const galleryItem = this.createElement('div', {
        className: 'gallery-item',
        attributes: {
          'data-image': itemData.image,
          'data-index': i,
          'data-text1': itemData.text1,
          'data-text2': itemData.text2,
          'data-text3': itemData.text3,
          'data-text4': itemData.text4,
          'data-text5': itemData.text5
        }
      });

      const img = this.createElement('img', {
        attributes: {
          src: itemData.image,
          alt: itemData.text1 || `Gallery Image ${i + 1}`
        }
      });

      galleryItem.appendChild(img);
      galleryCircle.appendChild(galleryItem);
    }
  }

  /**
   * Get required DOM elements for gallery functionality
   * @returns {Object} Object containing all required DOM elements
   * @throws {Error} If required elements are not found
   */
  static getRequiredElements() {
    const elements = {};

    // Generate gallery items first
    this.generateGalleryItems();

    // Get gallery items
    elements.galleryItems = this.querySelectorAll(DOM_SELECTORS.galleryItems);
    if (elements.galleryItems.length === 0) {
      throw new Error('Gallery items not found');
    }

    // Get modal elements
    elements.modal = this.querySelector(DOM_SELECTORS.modal);
    if (!elements.modal) {
      throw new Error('Modal element not found');
    }

    elements.modalImage = this.querySelector(DOM_SELECTORS.modalImage);
    if (!elements.modalImage) {
      throw new Error('Modal image element not found');
    }

    elements.closeButton = this.querySelector(DOM_SELECTORS.closeButton);
    if (!elements.closeButton) {
      throw new Error('Close button not found');
    }

    elements.modalBackground = this.querySelector(DOM_SELECTORS.modalBackground);
    if (!elements.modalBackground) {
      throw new Error('Modal background not found');
    }

    elements.connectionSvg = this.querySelector(DOM_SELECTORS.connectionSvg);
    if (!elements.connectionSvg) {
      throw new Error('Connection SVG not found');
    }

    elements.galleryContainer = this.querySelector(DOM_SELECTORS.galleryContainer);
    if (!elements.galleryContainer) {
      throw new Error('Gallery container not found');
    }

    return elements;
  }

  /**
   * Create SVG element with namespace
   * @param {string} tagName - SVG tag name
   * @param {Object} attributes - Attributes to set
   * @returns {SVGElement} Created SVG element
   */
  static createSVGElement(tagName, attributes = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    return element;
  }

  /**
   * Create HTML element with attributes and content
   * @param {string} tagName - HTML tag name
   * @param {Object} options - Creation options
   * @returns {HTMLElement} Created element
   */
  static createElement(tagName, options = {}) {
    const element = document.createElement(tagName);

    if (options.className) {
      element.className = options.className;
    }

    if (options.id) {
      element.id = options.id;
    }

    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }

    if (options.style) {
      Object.entries(options.style).forEach(([key, value]) => {
        element.style[key] = value;
      });
    }

    if (options.textContent) {
      element.textContent = options.textContent;
    }

    if (options.innerHTML) {
      element.innerHTML = options.innerHTML;
    }

    return element;
  }

  /**
   * Add multiple CSS classes to an element
   * @param {HTMLElement} element - Target element
   * @param {string|Array} classes - Class names to add
   */
  static addClass(element, classes) {
    if (!element) return;

    if (typeof classes === 'string') {
      element.classList.add(classes);
    } else if (Array.isArray(classes)) {
      classes.forEach(cls => element.classList.add(cls));
    }
  }

  /**
   * Remove multiple CSS classes from an element
   * @param {HTMLElement} element - Target element
   * @param {string|Array} classes - Class names to remove
   */
  static removeClass(element, classes) {
    if (!element) return;

    if (typeof classes === 'string') {
      element.classList.remove(classes);
    } else if (Array.isArray(classes)) {
      classes.forEach(cls => element.classList.remove(cls));
    }
  }

  /**
   * Toggle CSS class on an element
   * @param {HTMLElement} element - Target element
   * @param {string} className - Class name to toggle
   * @returns {boolean} True if class was added, false if removed
   */
  static toggleClass(element, className) {
    if (!element) return false;
    return element.classList.toggle(className);
  }

  /**
   * Check if element has CSS class
   * @param {HTMLElement} element - Target element
   * @param {string} className - Class name to check
   * @returns {boolean} True if element has class
   */
  static hasClass(element, className) {
    if (!element) return false;
    return element.classList.contains(className);
  }

  /**
   * Set multiple CSS styles on an element
   * @param {HTMLElement} element - Target element
   * @param {Object} styles - Style properties to set
   */
  static setStyles(element, styles) {
    if (!element || !styles) return;

    Object.entries(styles).forEach(([property, value]) => {
      element.style[property] = value;
    });
  }

  /**
   * Get element's bounding rectangle
   * @param {HTMLElement} element - Target element
   * @returns {DOMRect|null} Bounding rectangle or null
   */
  static getBounds(element) {
    if (!element) return null;
    return element.getBoundingClientRect();
  }

  /**
   * Check if element is visible in viewport
   * @param {HTMLElement} element - Target element
   * @returns {boolean} True if element is visible
   */
  static isElementVisible(element) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return rect.top >= 0 &&
           rect.left >= 0 &&
           rect.bottom <= window.innerHeight &&
           rect.right <= window.innerWidth;
  }

  /**
   * Remove element from DOM safely
   * @param {HTMLElement} element - Element to remove
   */
  static removeElement(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  /**
   * Wait for DOM to be ready
   * @returns {Promise} Promise that resolves when DOM is ready
   */
  static waitForDOM() {
    return new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  }

  /**
   * Debounce function execution
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function execution
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  static throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}