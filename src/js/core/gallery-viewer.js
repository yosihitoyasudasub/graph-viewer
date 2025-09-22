import { GALLERY_CONFIG, DOM_SELECTORS } from './config.js';
import { GraphManager } from '../modules/graph-manager.js';
import { AnimationManager } from '../modules/animation-manager.js';
import { EventManager } from '../modules/event-manager.js';
import { PathManager } from '../modules/path-manager.js';
import { DOMUtils } from '../utils/dom-utils.js';

export class GSAPGalleryViewer {
  constructor() {
    this.isInitialized = false;
    this.hasErrors = false;

    try {
      this.initializeProperties();
      this.initializeManagers();
      this.init();
      this.isInitialized = true;
    } catch (error) {
      this.hasErrors = true;
      console.error('Gallery initialization failed:', error);
      this.showFallbackMessage();
    }
  }

  /**
   * Initialize class properties
   */
  initializeProperties() {
    try {
      this.elements = DOMUtils.getRequiredElements();
    } catch (error) {
      console.error('Failed to initialize gallery:', error.message);
      throw error;
    }

    this.itemCount = this.elements.galleryItems.length;

    if (this.itemCount === 0) {
      throw new Error('No gallery items found');
    }
  }

  /**
   * Initialize manager instances
   */
  initializeManagers() {
    try {
      this.graphManager = new GraphManager(this.itemCount);
      this.animationManager = new AnimationManager();
      this.eventManager = new EventManager();
      this.pathManager = new PathManager(this.elements.connectionSvg);
    } catch (error) {
      console.error('Failed to initialize managers:', error);
      throw error;
    }
  }

  /**
   * Initialize the gallery
   */
  init() {
    if (this.hasErrors) {
      console.warn('Skipping gallery initialization due to previous errors');
      return;
    }

    try {
      this.setup3DPerspective();
      this.setupCircularLayout();
      this.setupEventListeners();
      this.animateGalleryItems();
    } catch (error) {
      console.error('Error during gallery initialization:', error);
      this.showFallbackMessage();
      throw error;
    }
  }

  /**
   * Setup 3D perspective for gallery items
   */
  setup3DPerspective() {
    this.animationManager.setTransformOrigins(this.elements.galleryItems);
  }

  /**
   * Setup initial circular layout
   */
  setupCircularLayout() {
    this.animationManager.setupInitialLayout(this.elements.galleryItems);
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    this.eventManager.setupEventListeners({
      onItemClick: (item, index) => this.openModal(item),
      onModalClose: () => this.closeModal(),
      onEscapeKey: () => this.closeModal()
    });

    // Setup reset button listener
    this.setupResetButtonListener();
  }

  /**
   * Setup reset button event listener
   */
  setupResetButtonListener() {
    const resetButton = document.getElementById('reset-paths-btn');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        this.pathManager.resetAllPaths();
      });
    } else {
      console.warn('Reset button not found - reset functionality will not be available');
    }
  }

  /**
   * Setup hover events after animation completion
   */
  setupHoverEvents() {
    this.eventManager.setupUnifiedItemHoverEvents(
      this.elements.galleryItems,
      (itemIndex, isHover) => this.onItemHover(itemIndex, isHover),
      (item, isHover) => this.animationManager.executeHoverAnimation(item, isHover)
    );
  }

  /**
   * Animate gallery items into position
   */
  animateGalleryItems() {
    this.animationManager.animateGalleryItems(
      this.elements.galleryItems,
      () => this.setupConnectionLines()
    );
  }

  /**
   * Setup connection lines between items
   */
  setupConnectionLines() {
    const connections = this.graphManager.getConnections();
    this.pathManager.createConnectionLines(connections);
    this.animateConnectionLines();
    this.setupPathEvents();
    this.setupHoverEvents(); // Setup hover events after animations complete
  }

  /**
   * Animate connection lines
   */
  animateConnectionLines() {
    const connectionLines = this.pathManager.getConnectionLines();
    connectionLines.forEach((lineData, index) => {
      this.animationManager.animatePathStroke(lineData.element, index * GALLERY_CONFIG.animation.pathStrokeDelay);
    });
  }

  /**
   * Setup path interaction events
   */
  setupPathEvents() {
    const connectionLines = this.pathManager.getConnectionLines();

    this.eventManager.setupPathEvents(
      connectionLines,
      (pathElement, lineData) => this.onPathClick(pathElement)
    );

    this.eventManager.setupPathHoverEvents(
      connectionLines,
      (pathElement, isHover) => this.onPathHover(pathElement, isHover)
    );
  }

  /**
   * Handle item hover for connection highlighting
   * @param {number} itemIndex - Index of hovered item
   * @param {boolean} isHover - Whether entering or leaving hover
   */
  onItemHover(itemIndex, isHover) {
    this.pathManager.highlightConnections(itemIndex, isHover);
  }

  /**
   * Handle path click
   * @param {SVGPathElement} pathElement - Clicked path element
   */
  onPathClick(pathElement) {
    this.pathManager.togglePathState(pathElement);
  }

  /**
   * Handle path hover
   * @param {SVGPathElement} pathElement - Hovered path element
   * @param {boolean} isHover - Whether entering or leaving hover
   */
  onPathHover(pathElement, isHover) {
    this.animationManager.animatePathHover(pathElement, isHover);
  }

  /**
   * Open modal with selected item and metadata
   * @param {HTMLElement} item - Clicked gallery item
   */
  openModal(item) {
    try {
      const imageUrl = item.getAttribute('data-image');
      const text1 = item.getAttribute('data-text1');
      const text2 = item.getAttribute('data-text2');
      const text3 = item.getAttribute('data-text3');
      const text4 = item.getAttribute('data-text4');
      const text5 = item.getAttribute('data-text5');

      if (!imageUrl) {
        console.error('No image URL found for gallery item');
        return;
      }

      // Update modal content with metadata
      const modalImage = this.elements.modalImage;
      const modalText1 = document.getElementById('modal-text1');
      const modalText2 = document.getElementById('modal-text2');
      const modalText3 = document.getElementById('modal-text3');
      const modalText4 = document.getElementById('modal-text4');
      const modalText5 = document.getElementById('modal-text5');

      if (modalImage) modalImage.src = imageUrl;
      if (modalText1) modalText1.textContent = text1 || 'タイトルなし';
      if (modalText2) modalText2.textContent = text2 || '説明がありません';
      if (modalText3) modalText3.textContent = text3 || 'カテゴリなし';
      if (modalText4) modalText4.textContent = text4 || '日付不明';
      if (modalText5) modalText5.textContent = text5 || '作者不明';

      // Open modal using animation manager
      this.animationManager.openModal(
        this.elements.modal,
        this.elements.modalBackground,
        this.elements.modalImage,
        item,
        imageUrl
      );
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }

  /**
   * Close modal
   */
  closeModal() {
    this.animationManager.closeModal(
      this.elements.modal,
      this.elements.modalBackground
    );
  }

  /**
   * Get gallery statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      itemCount: this.itemCount,
      connectionCount: this.pathManager.getConnectionCount(),
      eventListenerCount: this.eventManager.getListenerCount()
    };
  }

  /**
   * Show fallback message when gallery fails to initialize
   */
  showFallbackMessage() {
    try {
      const container = document.querySelector('.gallery-container');
      if (container) {
        container.innerHTML = `
          <div class="fallback-message" style="
            text-align: center;
            padding: 40px;
            color: #666;
            font-family: Arial, sans-serif;
          ">
            <h3>Gallery Not Available</h3>
            <p>The gallery could not be loaded properly. Please check the console for error details.</p>
            <p>Ensure all required files are loaded and the DOM structure is correct.</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('Failed to show fallback message:', error);
    }
  }

  /**
   * Check if gallery is properly initialized
   * @returns {boolean} Whether gallery is ready
   */
  isReady() {
    return this.isInitialized && !this.hasErrors;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.eventManager) {
      this.eventManager.cleanup();
    }
    if (this.pathManager) {
      this.pathManager.clearConnections();
    }
    console.log('Gallery viewer destroyed');
  }
}