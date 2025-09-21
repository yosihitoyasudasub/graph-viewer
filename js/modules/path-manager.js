import { GALLERY_CONFIG, PATH_STATES } from '../core/config.js';
import { MathUtils } from '../utils/math-utils.js';
import { AnimationHelpers } from '../utils/animation-helpers.js';

export class PathManager {
  constructor(connectionSvg) {
    this.connectionSvg = connectionSvg;
    this.connectionLines = [];
    this.isEnabled = !!connectionSvg;

    if (!this.isEnabled) {
      console.warn('PathManager initialized without SVG element - connection lines will be disabled');
    }
  }

  /**
   * Create all connection lines based on graph connections
   * @param {Array} connections - Array of {from, to} connection objects
   */
  createConnectionLines(connections) {
    if (!this.isEnabled) {
      console.info('Path creation skipped - SVG element not available');
      return;
    }

    if (!connections || connections.length === 0) {
      console.warn('No connections provided for path creation');
      return;
    }

    try {
      connections.forEach(connection => {
        this.createSingleLine(connection.from, connection.to);
      });
    } catch (error) {
      console.error('Error creating connection lines:', error);
    }
  }

  /**
   * Create a single connection line between two items
   * @param {number} index1 - First item index
   * @param {number} index2 - Second item index
   */
  createSingleLine(index1, index2) {
    if (!this.isEnabled) {
      return null;
    }

    if (!this.connectionSvg) {
      console.error('Connection SVG not available for line creation');
      return null;
    }

    if (typeof index1 !== 'number' || typeof index2 !== 'number') {
      console.error('Invalid indices provided for line creation:', index1, index2);
      return null;
    }

    try {
      const pos1 = MathUtils.getItemPosition(index1);
      const pos2 = MathUtils.getItemPosition(index2);

      let pathData;
      if (MathUtils.isDiagonalPair(index1, index2)) {
        pathData = this.createLinearPath(pos1, pos2);
      } else {
        pathData = this.createArcPath(pos1, pos2);
      }

      const pathElement = this.createPathElement(pathData, index1, index2);
      if (!pathElement) {
        console.error('Failed to create path element');
        return null;
      }

      this.connectionSvg.appendChild(pathElement);

      const lineData = {
        element: pathElement,
        from: index1,
        to: index2,
        state: PATH_STATES.PINK_SOLID
      };

      this.connectionLines.push(lineData);
      return lineData;
    } catch (error) {
      console.error('Error creating connection line:', error);
      return null;
    }
  }

  /**
   * Create SVG path element
   * @param {string} pathData - SVG path data
   * @param {number} index1 - First item index
   * @param {number} index2 - Second item index
   * @returns {SVGPathElement} Created path element
   */
  createPathElement(pathData, index1, index2) {
    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('class', 'connection-line');
    pathElement.setAttribute('d', pathData);
    pathElement.setAttribute('fill', 'none');
    pathElement.setAttribute('stroke', GALLERY_CONFIG.path.colors.pink);
    pathElement.setAttribute('stroke-width', GALLERY_CONFIG.path.strokeWidth.normal);
    pathElement.setAttribute('opacity', GALLERY_CONFIG.path.opacity.normal);
    pathElement.setAttribute('data-from', index1);
    pathElement.setAttribute('data-to', index2);

    return pathElement;
  }

  /**
   * Create linear path data
   * @param {Object} pos1 - First position {x, y}
   * @param {Object} pos2 - Second position {x, y}
   * @returns {string} SVG path data
   */
  createLinearPath(pos1, pos2) {
    return `M ${pos1.x} ${pos1.y} L ${pos2.x} ${pos2.y}`;
  }

  /**
   * Create arc path data (curved toward center)
   * @param {Object} pos1 - First position {x, y}
   * @param {Object} pos2 - Second position {x, y}
   * @returns {string} SVG path data
   */
  createArcPath(pos1, pos2) {
    const midX = (pos1.x + pos2.x) / 2;
    const midY = (pos1.y + pos2.y) / 2;

    const centerVectorX = GALLERY_CONFIG.centerX - midX;
    const centerVectorY = GALLERY_CONFIG.centerY - midY;
    const centerDistance = Math.sqrt(centerVectorX * centerVectorX + centerVectorY * centerVectorY);

    const normalizedX = centerVectorX / centerDistance;
    const normalizedY = centerVectorY / centerDistance;

    const arcHeight = GALLERY_CONFIG.radius * GALLERY_CONFIG.arcHeightRatio;
    const controlX = midX + normalizedX * arcHeight;
    const controlY = midY + normalizedY * arcHeight;

    return `M ${pos1.x} ${pos1.y} Q ${controlX} ${controlY} ${pos2.x} ${pos2.y}`;
  }

  /**
   * Toggle path state (cycle through states)
   * @param {SVGPathElement} pathElement - Path element to toggle
   */
  togglePathState(pathElement) {
    const lineData = this.connectionLines.find(line => line.element === pathElement);
    if (!lineData) return;

    lineData.state = (lineData.state + 1) % 3;
    this.applyPathVisualState(lineData);
  }

  /**
   * Apply visual state to path element
   * @param {Object} lineData - Line data object
   */
  applyPathVisualState(lineData) {
    const element = lineData.element;

    switch(lineData.state) {
      case PATH_STATES.PINK_SOLID:
        element.removeAttribute('stroke-dasharray');
        AnimationHelpers.animatePathState(element, {
          opacity: GALLERY_CONFIG.path.opacity.normal,
          stroke: GALLERY_CONFIG.path.colors.pink
        });
        break;

      case PATH_STATES.GREEN_SOLID:
        element.removeAttribute('stroke-dasharray');
        AnimationHelpers.animatePathState(element, {
          opacity: GALLERY_CONFIG.path.opacity.normal,
          stroke: GALLERY_CONFIG.path.colors.green
        });
        break;

      case PATH_STATES.TRANSPARENT:
        element.removeAttribute('stroke-dasharray');
        AnimationHelpers.animatePathState(element, {
          opacity: GALLERY_CONFIG.path.opacity.light,
          stroke: GALLERY_CONFIG.path.colors.pink
        });
        break;
    }
  }

  /**
   * Highlight connections for a specific item
   * @param {number} itemIndex - Index of the item to highlight
   * @param {boolean} isHighlight - Whether to highlight or restore
   */
  highlightConnections(itemIndex, isHighlight) {
    if (!this.isEnabled) {
      return;
    }

    try {
      const relevantPaths = this.connectionLines.filter(lineData =>
        lineData.from === itemIndex || lineData.to === itemIndex
      );

      if (relevantPaths.length === 0) {
        return;
      }

      const getOpacityFn = (pathData) => {
        if (isHighlight) {
          return pathData.state === PATH_STATES.TRANSPARENT ?
            GALLERY_CONFIG.path.opacity.lightHighlight :
            GALLERY_CONFIG.path.opacity.highlight;
        } else {
          return pathData.state === PATH_STATES.TRANSPARENT ?
            GALLERY_CONFIG.path.opacity.light :
            GALLERY_CONFIG.path.opacity.normal;
        }
      };

      AnimationHelpers.animateConnectionHighlight(relevantPaths, isHighlight, getOpacityFn);
    } catch (error) {
      console.error('Error highlighting connections:', error);
    }
  }

  /**
   * Get all connection lines
   * @returns {Array} Array of connection line data
   */
  getConnectionLines() {
    return this.connectionLines;
  }

  /**
   * Find connection line by element
   * @param {SVGPathElement} pathElement - Path element
   * @returns {Object|null} Line data object or null
   */
  findLineData(pathElement) {
    return this.connectionLines.find(line => line.element === pathElement) || null;
  }

  /**
   * Get connections for a specific item
   * @param {number} itemIndex - Index of the item
   * @returns {Array} Array of connected line data
   */
  getItemConnections(itemIndex) {
    return this.connectionLines.filter(lineData =>
      lineData.from === itemIndex || lineData.to === itemIndex
    );
  }

  /**
   * Clear all connection lines
   */
  clearConnections() {
    this.connectionLines.forEach(lineData => {
      if (lineData.element.parentNode) {
        lineData.element.parentNode.removeChild(lineData.element);
      }
    });
    this.connectionLines = [];
  }

  /**
   * Get total number of connections
   * @returns {number} Number of connections
   */
  getConnectionCount() {
    return this.connectionLines.length;
  }
}