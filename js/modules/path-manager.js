import { GALLERY_CONFIG, PATH_STATES } from '../core/config.js';
import { MathUtils } from '../utils/math-utils.js';

export class PathManager {
  constructor(connectionSvg) {
    this.connectionSvg = connectionSvg;
    this.connectionLines = [];
  }

  /**
   * Create all connection lines based on graph connections
   * @param {Array} connections - Array of {from, to} connection objects
   */
  createConnectionLines(connections) {
    connections.forEach(connection => {
      this.createSingleLine(connection.from, connection.to);
    });
  }

  /**
   * Create a single connection line between two items
   * @param {number} index1 - First item index
   * @param {number} index2 - Second item index
   */
  createSingleLine(index1, index2) {
    const pos1 = MathUtils.getItemPosition(index1);
    const pos2 = MathUtils.getItemPosition(index2);

    let pathData;
    if (MathUtils.isDiagonalPair(index1, index2)) {
      pathData = this.createLinearPath(pos1, pos2);
    } else {
      pathData = this.createArcPath(pos1, pos2);
    }

    const pathElement = this.createPathElement(pathData, index1, index2);
    this.connectionSvg.appendChild(pathElement);

    const lineData = {
      element: pathElement,
      from: index1,
      to: index2,
      state: PATH_STATES.PINK_SOLID
    };

    this.connectionLines.push(lineData);
    return lineData;
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
        element.style.stroke = GALLERY_CONFIG.path.colors.pink;
        gsap.to(element, {
          opacity: GALLERY_CONFIG.path.opacity.normal,
          duration: GALLERY_CONFIG.animation.modalDuration,
          ease: GALLERY_CONFIG.animation.modalEase
        });
        break;

      case PATH_STATES.GREEN_SOLID:
        element.removeAttribute('stroke-dasharray');
        element.style.stroke = GALLERY_CONFIG.path.colors.green;
        gsap.to(element, {
          opacity: GALLERY_CONFIG.path.opacity.normal,
          duration: GALLERY_CONFIG.animation.modalDuration,
          ease: GALLERY_CONFIG.animation.modalEase
        });
        break;

      case PATH_STATES.TRANSPARENT:
        element.removeAttribute('stroke-dasharray');
        element.style.stroke = GALLERY_CONFIG.path.colors.pink;
        gsap.to(element, {
          opacity: GALLERY_CONFIG.path.opacity.light,
          duration: GALLERY_CONFIG.animation.modalDuration,
          ease: GALLERY_CONFIG.animation.modalEase
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
    this.connectionLines.forEach(lineData => {
      if (lineData.from === itemIndex || lineData.to === itemIndex) {
        if (isHighlight) {
          const targetOpacity = lineData.state === PATH_STATES.TRANSPARENT ?
            GALLERY_CONFIG.path.opacity.lightHighlight :
            GALLERY_CONFIG.path.opacity.highlight;

          gsap.to(lineData.element, {
            strokeWidth: GALLERY_CONFIG.path.strokeWidth.hover,
            opacity: targetOpacity,
            duration: GALLERY_CONFIG.animation.modalDuration
          });
        } else {
          const targetOpacity = lineData.state === PATH_STATES.TRANSPARENT ?
            GALLERY_CONFIG.path.opacity.light :
            GALLERY_CONFIG.path.opacity.normal;

          gsap.to(lineData.element, {
            strokeWidth: GALLERY_CONFIG.path.strokeWidth.normal,
            opacity: targetOpacity,
            duration: GALLERY_CONFIG.animation.modalDuration
          });
        }
      }
    });
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