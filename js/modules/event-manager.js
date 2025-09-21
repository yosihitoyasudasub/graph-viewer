import { DOM_SELECTORS } from '../core/config.js';
import { DOMUtils } from '../utils/dom-utils.js';

export class EventManager {
  constructor() {
    this.eventListeners = new Map();
  }

  /**
   * Setup all event listeners for the gallery
   * @param {Object} handlers - Event handler functions
   */
  setupEventListeners(handlers) {
    this.setupGalleryItemEvents(handlers.onItemClick);
    this.setupModalEvents(handlers.onModalClose);
    this.setupKeyboardEvents(handlers.onEscapeKey);
  }

  /**
   * Setup click events for gallery items
   * @param {Function} onItemClick - Click handler function
   */
  setupGalleryItemEvents(onItemClick) {
    const galleryItems = DOMUtils.querySelectorAll(DOM_SELECTORS.galleryItems);

    if (galleryItems.length === 0) {
      console.warn('No gallery items found for click events');
      return;
    }

    galleryItems.forEach((item, index) => {
      const clickHandler = (e) => onItemClick(e.currentTarget, index);
      item.addEventListener('click', clickHandler);

      // Store reference for cleanup
      this.eventListeners.set(`gallery-item-${index}`, {
        element: item,
        event: 'click',
        handler: clickHandler
      });
    });
  }

  /**
   * Setup modal close events
   * @param {Function} onModalClose - Close handler function
   */
  setupModalEvents(onModalClose) {
    const closeButton = DOMUtils.querySelector(DOM_SELECTORS.closeButton);
    const modalBackground = DOMUtils.querySelector(DOM_SELECTORS.modalBackground);

    if (closeButton) {
      const closeHandler = () => onModalClose();
      closeButton.addEventListener('click', closeHandler);

      this.eventListeners.set('close-button', {
        element: closeButton,
        event: 'click',
        handler: closeHandler
      });
    } else {
      console.warn('Close button not found - modal close via button will not work');
    }

    if (modalBackground) {
      const backgroundHandler = () => onModalClose();
      modalBackground.addEventListener('click', backgroundHandler);

      this.eventListeners.set('modal-background', {
        element: modalBackground,
        event: 'click',
        handler: backgroundHandler
      });
    } else {
      console.warn('Modal background not found - modal close via background will not work');
    }
  }

  /**
   * Setup keyboard events
   * @param {Function} onEscapeKey - Escape key handler function
   */
  setupKeyboardEvents(onEscapeKey) {
    const keydownHandler = (e) => {
      if (e.key === 'Escape') {
        onEscapeKey();
      }
    };

    document.addEventListener('keydown', keydownHandler);

    this.eventListeners.set('document-keydown', {
      element: document,
      event: 'keydown',
      handler: keydownHandler
    });
  }

  /**
   * Setup path click events
   * @param {Array} pathElements - Array of SVG path elements
   * @param {Function} onPathClick - Path click handler
   */
  setupPathEvents(pathElements, onPathClick) {
    pathElements.forEach((pathData, index) => {
      const pathElement = pathData.element;

      const clickHandler = (e) => {
        e.stopPropagation();
        onPathClick(pathElement, pathData);
      };

      pathElement.addEventListener('click', clickHandler);
      pathElement.style.cursor = 'pointer';
      pathElement.style.pointerEvents = 'auto';

      this.eventListeners.set(`path-${index}`, {
        element: pathElement,
        event: 'click',
        handler: clickHandler
      });
    });
  }

  /**
   * Setup path hover events
   * @param {Array} pathElements - Array of SVG path elements
   * @param {Function} onPathHover - Path hover handler
   */
  setupPathHoverEvents(pathElements, onPathHover) {
    pathElements.forEach((pathData, index) => {
      const pathElement = pathData.element;

      const mouseEnterHandler = () => onPathHover(pathElement, true);
      const mouseLeaveHandler = () => onPathHover(pathElement, false);

      pathElement.addEventListener('mouseenter', mouseEnterHandler);
      pathElement.addEventListener('mouseleave', mouseLeaveHandler);

      this.eventListeners.set(`path-hover-enter-${index}`, {
        element: pathElement,
        event: 'mouseenter',
        handler: mouseEnterHandler
      });

      this.eventListeners.set(`path-hover-leave-${index}`, {
        element: pathElement,
        event: 'mouseleave',
        handler: mouseLeaveHandler
      });
    });
  }

  /**
   * Setup unified gallery item hover events (animation + connection highlighting)
   * @param {NodeList} galleryItems - Gallery item elements
   * @param {Function} onItemHover - Item hover handler for connections
   * @param {Function} onItemAnimation - Item animation handler
   */
  setupUnifiedItemHoverEvents(galleryItems, onItemHover, onItemAnimation) {
    galleryItems.forEach((item, index) => {
      const mouseEnterHandler = () => {
        onItemAnimation(item, true);  // Execute hover animation
        onItemHover(index, true);     // Execute connection highlighting
      };

      const mouseLeaveHandler = () => {
        onItemAnimation(item, false); // Execute hover animation
        onItemHover(index, false);    // Execute connection highlighting
      };

      item.addEventListener('mouseenter', mouseEnterHandler);
      item.addEventListener('mouseleave', mouseLeaveHandler);

      this.eventListeners.set(`unified-hover-enter-${index}`, {
        element: item,
        event: 'mouseenter',
        handler: mouseEnterHandler
      });

      this.eventListeners.set(`unified-hover-leave-${index}`, {
        element: item,
        event: 'mouseleave',
        handler: mouseLeaveHandler
      });
    });
  }

  /**
   * Setup gallery item hover events for connection highlighting only
   * @param {NodeList} galleryItems - Gallery item elements
   * @param {Function} onItemHover - Item hover handler
   */
  setupItemHoverEvents(galleryItems, onItemHover) {
    galleryItems.forEach((item, index) => {
      const mouseEnterHandler = () => onItemHover(index, true);
      const mouseLeaveHandler = () => onItemHover(index, false);

      item.addEventListener('mouseenter', mouseEnterHandler);
      item.addEventListener('mouseleave', mouseLeaveHandler);

      this.eventListeners.set(`item-hover-enter-${index}`, {
        element: item,
        event: 'mouseenter',
        handler: mouseEnterHandler
      });

      this.eventListeners.set(`item-hover-leave-${index}`, {
        element: item,
        event: 'mouseleave',
        handler: mouseLeaveHandler
      });
    });
  }

  /**
   * Add single event listener with automatic cleanup tracking
   * @param {HTMLElement} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {string} id - Unique identifier for cleanup
   */
  addEventListener(element, event, handler, id) {
    element.addEventListener(event, handler);

    this.eventListeners.set(id, {
      element,
      event,
      handler
    });
  }

  /**
   * Remove specific event listener
   * @param {string} id - Event listener identifier
   */
  removeEventListener(id) {
    const listener = this.eventListeners.get(id);
    if (listener) {
      listener.element.removeEventListener(listener.event, listener.handler);
      this.eventListeners.delete(id);
    }
  }

  /**
   * Clean up all event listeners
   */
  cleanup() {
    this.eventListeners.forEach((listener, id) => {
      listener.element.removeEventListener(listener.event, listener.handler);
    });
    this.eventListeners.clear();
  }

  /**
   * Get count of active event listeners
   * @returns {number} Number of active listeners
   */
  getListenerCount() {
    return this.eventListeners.size;
  }
}