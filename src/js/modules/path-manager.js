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
    console.log('PathManager: Configuration changed to', newBreakpoint.name);

    const newConfig = GALLERY_CONFIG.current;

    // Update SVG viewBox if needed
    this._updateSVGViewBox(newConfig);

    // Rebuild all paths with new positions
    this._rebuildAllPaths();

    // Update cached configuration
    this._currentConfig = newConfig;
  }

  /**
   * Update SVG viewBox based on current configuration
   * @param {Object} config - Current configuration
   * @private
   */
  _updateSVGViewBox(config) {
    if (!this.isEnabled || !this.connectionSvg) return;

    try {
      // Set SVG dimensions to match container
      this.connectionSvg.setAttribute('width', config.containerWidth);
      this.connectionSvg.setAttribute('height', config.containerHeight);
      this.connectionSvg.setAttribute('viewBox', `0 0 ${config.containerWidth} ${config.containerHeight}`);

      console.log('PathManager: SVG viewBox updated to', config.containerWidth, 'x', config.containerHeight);
    } catch (error) {
      console.error('Error updating SVG viewBox:', error);
    }
  }

  /**
   * Rebuild all paths with current configuration
   * @private
   */
  _rebuildAllPaths() {
    if (!this.isEnabled) return;

    try {
      // Store current states before rebuilding
      const currentStates = new Map();
      this.connectionLines.forEach(lineData => {
        const key = `${lineData.from}-${lineData.to}`;
        currentStates.set(key, lineData.state);
      });

      // Clear existing paths
      this.clearConnections();

      // Get current item count and recreate connections
      const itemCount = GALLERY_CONFIG.itemCount;
      const connections = [];

      // Recreate complete graph connections
      for (let i = 0; i < itemCount; i++) {
        for (let j = i + 1; j < itemCount; j++) {
          connections.push({ from: i, to: j });
        }
      }

      // Recreate paths with stored states
      this.createConnectionLines(connections);

      // Restore previous states
      this.connectionLines.forEach(lineData => {
        const key = `${lineData.from}-${lineData.to}`;
        if (currentStates.has(key)) {
          lineData.state = currentStates.get(key);
          this.applyPathVisualState(lineData);
        }
      });

      console.log('PathManager: All paths rebuilt for new configuration');
    } catch (error) {
      console.error('Error rebuilding paths:', error);
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
      const config = GALLERY_CONFIG.current;
      const itemCount = config.itemCount;

      const pos1 = MathUtils.getItemPosition(index1, itemCount);
      const pos2 = MathUtils.getItemPosition(index2, itemCount);

      let pathData;
      if (MathUtils.isDiagonalPair(index1, index2, itemCount)) {
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
        state: PATH_STATES.TRANSPARENT
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
    const config = GALLERY_CONFIG.current;

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('class', 'connection-line');
    pathElement.setAttribute('d', pathData);
    pathElement.setAttribute('fill', 'none');
    pathElement.setAttribute('stroke', config.path.colors.pink);
    pathElement.setAttribute('stroke-width', config.path.strokeWidth.normal);
    pathElement.setAttribute('opacity', config.path.opacity.light); // 初期は薄い透明度
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
    const config = GALLERY_CONFIG.current;
    const controlPoint = MathUtils.getArcControlPoint(pos1, pos2, config.arcHeightRatio);

    return `M ${pos1.x} ${pos1.y} Q ${controlPoint.x} ${controlPoint.y} ${pos2.x} ${pos2.y}`;
  }

  /**
   * Toggle path state (cycle through states: 2→0→1→2)
   * @param {SVGPathElement} pathElement - Path element to toggle
   */
  togglePathState(pathElement) {
    const lineData = this.connectionLines.find(line => line.element === pathElement);
    if (!lineData) return;

    // Custom cycle: TRANSPARENT(2) → PINK_SOLID(0) → GREEN_SOLID(1) → TRANSPARENT(2)
    switch(lineData.state) {
      case PATH_STATES.TRANSPARENT: // 2
        lineData.state = PATH_STATES.PINK_SOLID; // 0
        break;
      case PATH_STATES.PINK_SOLID: // 0
        lineData.state = PATH_STATES.GREEN_SOLID; // 1
        break;
      case PATH_STATES.GREEN_SOLID: // 1
        lineData.state = PATH_STATES.TRANSPARENT; // 2
        break;
      default:
        lineData.state = PATH_STATES.TRANSPARENT; // fallback
    }

    this.applyPathVisualState(lineData);
  }

  /**
   * Apply visual state to path element
   * @param {Object} lineData - Line data object
   */
  applyPathVisualState(lineData) {
    const element = lineData.element;
    const config = GALLERY_CONFIG.current;

    switch(lineData.state) {
      case PATH_STATES.PINK_SOLID:
        element.removeAttribute('stroke-dasharray');
        AnimationHelpers.animatePathState(element, {
          opacity: config.path.opacity.normal,
          stroke: config.path.colors.pink,
          strokeWidth: config.path.strokeWidth.normal
        });
        break;

      case PATH_STATES.GREEN_SOLID:
        element.removeAttribute('stroke-dasharray');
        AnimationHelpers.animatePathState(element, {
          opacity: config.path.opacity.normal,
          stroke: config.path.colors.green,
          strokeWidth: config.path.strokeWidth.normal
        });
        break;

      case PATH_STATES.TRANSPARENT:
        element.removeAttribute('stroke-dasharray');
        AnimationHelpers.animatePathState(element, {
          opacity: config.path.opacity.light,
          stroke: config.path.colors.pink,
          strokeWidth: config.path.strokeWidth.normal
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
      const config = GALLERY_CONFIG.current;
      const relevantPaths = this.connectionLines.filter(lineData =>
        lineData.from === itemIndex || lineData.to === itemIndex
      );

      if (relevantPaths.length === 0) {
        return;
      }

      const getOpacityFn = (pathData) => {
        if (isHighlight) {
          return pathData.state === PATH_STATES.TRANSPARENT ?
            config.path.opacity.lightHighlight :
            config.path.opacity.highlight;
        } else {
          return pathData.state === PATH_STATES.TRANSPARENT ?
            config.path.opacity.light :
            config.path.opacity.normal;
        }
      };

      // Update stroke width for hover effect
      relevantPaths.forEach(pathData => {
        const strokeWidth = isHighlight ?
          config.path.strokeWidth.hover :
          config.path.strokeWidth.normal;

        pathData.element.setAttribute('stroke-width', strokeWidth);
      });

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

  /**
   * Reset all paths to transparent state (light pink)
   */
  resetAllPaths() {
    if (!this.isEnabled) {
      console.info('Path reset skipped - SVG element not available');
      return;
    }

    try {
      this.connectionLines.forEach(lineData => {
        lineData.state = PATH_STATES.TRANSPARENT;
        this.applyPathVisualState(lineData);
      });
      console.log('All paths reset to transparent state');
    } catch (error) {
      console.error('Error resetting paths:', error);
    }
  }

  /**
   * Get current configuration information
   * @returns {Object} Current configuration summary
   */
  getCurrentConfig() {
    return {
      ...MathUtils.getCurrentLayoutConfig(),
      connectionCount: this.connectionLines.length,
      svgEnabled: this.isEnabled
    };
  }

  /**
   * Force refresh of all paths (useful after manual configuration changes)
   */
  refresh() {
    if (!this.isEnabled) return;

    console.log('PathManager: Force refreshing all paths');
    this._rebuildAllPaths();
  }

  /**
   * External method to handle configuration changes from GSAPGalleryViewer
   * @param {string} breakpointName - New breakpoint name
   */
  handleConfigChange(breakpointName) {
    this._handleConfigChange({ name: breakpointName });
  }

  /**
   * Cleanup - remove event listeners and clear connections
   */
  cleanup() {
    // No longer directly managing event listeners
    // GSAPGalleryViewer handles the coordination
    this.clearConnections();
    console.log('PathManager: Cleanup completed');
  }
}