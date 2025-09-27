import { GALLERY_CONFIG, DOM_SELECTORS } from './config.js';
import { GraphManager } from '../modules/graph-manager.js';
import { AnimationManager } from '../modules/animation-manager.js';
import { EventManager } from '../modules/event-manager.js';
import { PathManager } from '../modules/path-manager.js';
import { DOMUtils } from '../utils/dom-utils.js';
import { ResponsiveConfigManager } from '../utils/responsive-config.js';

export class GSAPGalleryViewer {
  constructor() {
    this.isInitialized = false;
    this.hasErrors = false;
    this.isFirstInitialization = true;

    try {
      this.initializeProperties();
      this.initializeManagers();
      this.setupResizeHandling();
      this.init();
      this.isInitialized = true;
      console.log('GSAPGalleryViewer: Initialization completed successfully');
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
      // Ensure ResponsiveConfigManager is initialized first
      ResponsiveConfigManager.init();

      // Get current configuration for initial setup
      this.currentConfig = GALLERY_CONFIG.current;
      console.log('GSAPGalleryViewer: Using configuration for', this.currentConfig.breakpoint);

      this.elements = DOMUtils.getRequiredElements();
    } catch (error) {
      console.error('Failed to initialize gallery properties:', error.message);
      throw error;
    }

    this.itemCount = Math.min(this.elements.galleryItems.length, this.currentConfig.itemCount);

    if (this.itemCount === 0) {
      throw new Error('No gallery items found');
    }

    console.log(`GSAPGalleryViewer: Initialized with ${this.itemCount} items`);
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

      console.log('GSAPGalleryViewer: All managers initialized');
    } catch (error) {
      console.error('Failed to initialize managers:', error);
      throw error;
    }
  }

  /**
   * Setup resize handling integration
   */
  setupResizeHandling() {
    try {
      // Register resize callback with EventManager
      this.eventManager.onResize('gallery-viewer', (breakpointName) => {
        this.handleResponsiveChange(breakpointName);
      });

      console.log('GSAPGalleryViewer: Resize handling configured');
    } catch (error) {
      console.error('Failed to setup resize handling:', error);
      throw error;
    }
  }

  /**
   * Handle responsive configuration changes
   * @param {string} breakpointName - New breakpoint name
   */
  handleResponsiveChange(breakpointName) {
    try {
      console.log(`GSAPGalleryViewer: Handling responsive change to ${breakpointName}`);

      const newConfig = GALLERY_CONFIG.current;

      // Notify all managers of the configuration change first
      this.notifyManagersOfConfigChange(breakpointName);

      // Check if significant changes require reinitialization
      const needsRebuild = this.needsRebuild(newConfig);

      if (needsRebuild) {
        console.log('GSAPGalleryViewer: Significant changes detected, rebuilding gallery');
        this.rebuildGallery(newConfig);
      } else {
        console.log('GSAPGalleryViewer: Minor changes, updating positions only');
        this.updatePositions(newConfig);
      }

      this.currentConfig = newConfig;
    } catch (error) {
      console.error('GSAPGalleryViewer: Error handling responsive change:', error);
    }
  }

  /**
   * Notify all managers of configuration changes
   * @param {string} breakpointName - New breakpoint name
   */
  notifyManagersOfConfigChange(breakpointName) {
    try {
      // Notify each manager in the correct order
      if (this.graphManager && typeof this.graphManager.handleConfigChange === 'function') {
        this.graphManager.handleConfigChange(breakpointName);
      }

      if (this.pathManager && typeof this.pathManager.handleConfigChange === 'function') {
        this.pathManager.handleConfigChange(breakpointName);
      }

      if (this.animationManager && typeof this.animationManager.handleConfigChange === 'function') {
        this.animationManager.handleConfigChange(breakpointName);
      }

      console.log(`GSAPGalleryViewer: All managers notified of ${breakpointName} change`);
    } catch (error) {
      console.error('GSAPGalleryViewer: Error notifying managers of config change:', error);
    }
  }

  /**
   * Check if gallery needs full rebuild
   * @param {Object} newConfig - New configuration
   * @returns {boolean} True if rebuild needed
   */
  needsRebuild(newConfig) {
    if (!this.currentConfig) return true;

    // Check for item count changes
    const newItemCount = Math.min(this.elements.galleryItems.length, newConfig.itemCount);
    if (newItemCount !== this.itemCount) {
      return true;
    }

    // Check for major layout changes
    const containerSizeChanged =
      this.currentConfig.containerWidth !== newConfig.containerWidth ||
      this.currentConfig.containerHeight !== newConfig.containerHeight;

    return containerSizeChanged;
  }

  /**
   * Rebuild gallery for significant changes
   * @param {Object} newConfig - New configuration
   */
  rebuildGallery(newConfig) {
    try {
      // Update item count
      this.itemCount = Math.min(this.elements.galleryItems.length, newConfig.itemCount);

      // Clear existing connections
      this.pathManager.clearConnections();

      // Update managers
      this.graphManager.updateItemCount(this.itemCount);

      // Re-setup initial layout with new configuration
      this.animationManager.setupInitialLayout(this.elements.galleryItems);

      // Re-animate items to new positions
      this.animationManager.animateGalleryItems(
        this.elements.galleryItems,
        () => {
          // Re-setup connections after animation
          this.setupConnectionLines();
        }
      );

      console.log('GSAPGalleryViewer: Gallery rebuilt successfully');
    } catch (error) {
      console.error('GSAPGalleryViewer: Error rebuilding gallery:', error);
    }
  }

  /**
   * Update positions for minor changes
   * @param {Object} newConfig - New configuration
   */
  updatePositions(newConfig) {
    try {
      // Managers will handle their own updates through their resize callbacks
      // This method is for any additional gallery-level position updates
      console.log('GSAPGalleryViewer: Positions updated for new configuration');
    } catch (error) {
      console.error('GSAPGalleryViewer: Error updating positions:', error);
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
      onEscapeKey: () => this.closeModal(),
      onResize: (breakpointName) => this.handleResponsiveChange(breakpointName)
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
      const config = GALLERY_CONFIG.current;
      this.animationManager.animatePathStroke(lineData.element, index * config.animation.pathStrokeDelay);
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
   * Get comprehensive gallery statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      itemCount: this.itemCount,
      maxItemCount: this.currentConfig.itemCount,
      connectionCount: this.pathManager.getConnectionCount(),
      eventListenerCount: this.eventManager.getListenerCount(),
      currentBreakpoint: this.currentConfig.breakpoint,
      isInitialized: this.isInitialized,
      hasErrors: this.hasErrors,
      managers: {
        graph: this.graphManager.getStats(),
        animation: this.animationManager.getCurrentAnimationConfig(),
        events: this.eventManager.getStatus(),
        paths: this.pathManager.getCurrentConfig()
      }
    };
  }

  /**
   * Get current configuration
   * @returns {Object} Current responsive configuration
   */
  getCurrentConfig() {
    return this.currentConfig;
  }

  /**
   * Force refresh gallery (useful for manual testing)
   */
  refresh() {
    console.log('GSAPGalleryViewer: Force refresh requested');
    const currentBreakpoint = GALLERY_CONFIG.getCurrentBreakpoint();
    this.handleResponsiveChange(currentBreakpoint);
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
            <details style="margin-top: 20px; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto;">
              <summary>Error Details</summary>
              <pre style="font-size: 12px; background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">
Current Configuration: ${this.currentConfig ? this.currentConfig.breakpoint : 'Not available'}
Item Count: ${this.itemCount || 'Unknown'}
Has Errors: ${this.hasErrors}
Initialized: ${this.isInitialized}
              </pre>
            </details>
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
    console.log('GSAPGalleryViewer: Starting cleanup');

    try {
      // Cleanup managers in reverse order of initialization
      if (this.pathManager) {
        this.pathManager.cleanup();
      }

      if (this.eventManager) {
        this.eventManager.cleanup();
      }

      if (this.animationManager) {
        this.animationManager.cleanup();
      }

      if (this.graphManager) {
        this.graphManager.cleanup();
      }

      // Reset state
      this.isInitialized = false;
      this.hasErrors = false;
      this.currentConfig = null;

      console.log('GSAPGalleryViewer: Cleanup completed successfully');
    } catch (error) {
      console.error('GSAPGalleryViewer: Error during cleanup:', error);
    }
  }
}