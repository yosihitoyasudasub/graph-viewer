import { GALLERY_CONFIG, DOM_SELECTORS } from './config.js';
import { GraphManager } from '../modules/graph-manager.js';
import { AnimationManager } from '../modules/animation-manager.js';
import { EventManager } from '../modules/event-manager.js';
import { PathManager } from '../modules/path-manager.js';
import { DOMUtils } from '../utils/dom-utils.js';

export class GSAPGalleryViewer {
  constructor() {
    this.initializeProperties();
    this.initializeManagers();
    this.init();
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
  }

  /**
   * Initialize manager instances
   */
  initializeManagers() {
    this.graphManager = new GraphManager(this.itemCount);
    this.animationManager = new AnimationManager();
    this.eventManager = new EventManager();
    this.pathManager = new PathManager(this.elements.connectionSvg);
  }

  /**
   * Initialize the gallery
   */
  init() {
    this.setup3DPerspective();
    this.setupCircularLayout();
    this.setupEventListeners();
    this.animateGalleryItems();
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

    // Setup hover events for items
    this.elements.galleryItems.forEach((item, index) => {
      this.animationManager.addHoverAnimation(
        item,
        index,
        (itemIndex) => this.onItemHover(itemIndex, true),
        (itemIndex) => this.onItemHover(itemIndex, false)
      );
    });
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
  }

  /**
   * Animate connection lines
   */
  animateConnectionLines() {
    const connectionLines = this.pathManager.getConnectionLines();
    connectionLines.forEach((lineData, index) => {
      this.animationManager.animatePathStroke(lineData.element, index * 0.2);
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
   * Open modal with selected item
   * @param {HTMLElement} item - Clicked gallery item
   */
  openModal(item) {
    const imageUrl = item.getAttribute('data-image');
    this.animationManager.openModal(
      this.elements.modal,
      this.elements.modalBackground,
      this.elements.modalImage,
      item,
      imageUrl
    );
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
   * Cleanup resources
   */
  destroy() {
    this.eventManager.cleanup();
    this.pathManager.clearConnections();
    console.log('Gallery viewer destroyed');
  }
}