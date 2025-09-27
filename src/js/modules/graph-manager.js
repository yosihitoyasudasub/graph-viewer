import { GALLERY_CONFIG } from '../core/config.js';
import { MathUtils } from '../utils/math-utils.js';

export class GraphManager {
  constructor(imageCount) {
    this.imageCount = imageCount || GALLERY_CONFIG.itemCount;
    this.adjacencyMatrix = this.initializeMatrix();
    this.setupCompleteGraph();

    // Bind config change handler for external calling
    this._onConfigChange = this._handleConfigChange.bind(this);
  }

  /**
   * Initialize adjacency matrix with zeros
   * @returns {number[][]} 2D array representing adjacency matrix
   */
  initializeMatrix() {
    return Array(this.imageCount)
      .fill(null)
      .map(() => Array(this.imageCount).fill(0));
  }

  /**
   * Setup complete graph connections (all nodes connected to all others)
   */
  setupCompleteGraph() {
    // Set diagonal elements to 0 (no self-loops)
    for (let i = 0; i < this.imageCount; i++) {
      this.adjacencyMatrix[i][i] = 0;
    }

    // Connect all pairs of nodes
    for (let i = 0; i < this.imageCount; i++) {
      for (let j = i + 1; j < this.imageCount; j++) {
        this.addEdge(i, j);
      }
    }

    console.log('GraphManager: Complete graph setup with', this.imageCount, 'nodes');
    console.log('Current configuration:', MathUtils.getCurrentLayoutConfig());
  }

  /**
   * Add undirected edge between two nodes
   * @param {number} i - First node index
   * @param {number} j - Second node index
   */
  addEdge(i, j) {
    if (this.isValidEdge(i, j)) {
      this.adjacencyMatrix[i][j] = 1;
      this.adjacencyMatrix[j][i] = 1; // Undirected graph
    }
  }

  /**
   * Remove edge between two nodes
   * @param {number} i - First node index
   * @param {number} j - Second node index
   */
  removeEdge(i, j) {
    if (this.isValidEdge(i, j)) {
      this.adjacencyMatrix[i][j] = 0;
      this.adjacencyMatrix[j][i] = 0;
    }
  }

  /**
   * Check if edge parameters are valid
   * @param {number} i - First node index
   * @param {number} j - Second node index
   * @returns {boolean} True if edge is valid
   */
  isValidEdge(i, j) {
    return i !== j &&
           i >= 0 && j >= 0 &&
           i < this.adjacencyMatrix.length &&
           j < this.adjacencyMatrix.length;
  }

  /**
   * Get all connections for iteration (upper triangle only)
   * @returns {Array<{from: number, to: number}>} Array of connections
   */
  getConnections() {
    const connections = [];
    for (let i = 0; i < this.adjacencyMatrix.length; i++) {
      for (let j = i + 1; j < this.adjacencyMatrix[i].length; j++) {
        if (this.adjacencyMatrix[i][j] === 1) {
          connections.push({ from: i, to: j });
        }
      }
    }
    return connections;
  }

  /**
   * Check if two nodes are connected
   * @param {number} i - First node index
   * @param {number} j - Second node index
   * @returns {boolean} True if nodes are connected
   */
  areConnected(i, j) {
    if (!this.isValidEdge(i, j)) return false;
    return this.adjacencyMatrix[i][j] === 1;
  }

  /**
   * Get all neighbors of a node
   * @param {number} nodeIndex - Index of the node
   * @returns {number[]} Array of neighbor indices
   */
  getNeighbors(nodeIndex) {
    if (nodeIndex < 0 || nodeIndex >= this.imageCount) return [];

    const neighbors = [];
    for (let i = 0; i < this.imageCount; i++) {
      if (this.adjacencyMatrix[nodeIndex][i] === 1) {
        neighbors.push(i);
      }
    }
    return neighbors;
  }

  /**
   * Get the degree of a node (number of connections)
   * @param {number} nodeIndex - Index of the node
   * @returns {number} Number of connections
   */
  getDegree(nodeIndex) {
    return this.getNeighbors(nodeIndex).length;
  }

  /**
   * Handle configuration changes (e.g., responsive breakpoint changes)
   * @param {Object} newBreakpoint - New breakpoint configuration
   * @private
   */
  _handleConfigChange(newBreakpoint) {
    console.log('GraphManager: Configuration changed to', newBreakpoint.name);

    // Update item count if it changed
    const newItemCount = GALLERY_CONFIG.itemCount;
    if (newItemCount !== this.imageCount) {
      console.log('GraphManager: Item count changed from', this.imageCount, 'to', newItemCount);
      this.updateItemCount(newItemCount);
    }
  }

  /**
   * Update the number of items and rebuild the graph
   * @param {number} newCount - New number of items
   */
  updateItemCount(newCount) {
    if (newCount === this.imageCount) return;

    this.imageCount = newCount;
    this.adjacencyMatrix = this.initializeMatrix();
    this.setupCompleteGraph();

    console.log('GraphManager: Graph rebuilt with', newCount, 'nodes');
  }

  /**
   * Get current item count
   * @returns {number} Current number of items
   */
  getItemCount() {
    return this.imageCount;
  }

  /**
   * Get graph statistics
   * @returns {Object} Graph statistics
   */
  getStats() {
    const totalConnections = this.getConnections().length;
    const possibleConnections = (this.imageCount * (this.imageCount - 1)) / 2;

    return {
      nodeCount: this.imageCount,
      totalConnections,
      possibleConnections,
      density: possibleConnections > 0 ? totalConnections / possibleConnections : 0,
      averageDegree: this.imageCount > 0 ? (totalConnections * 2) / this.imageCount : 0,
      configuration: MathUtils.getCurrentLayoutConfig()
    };
  }

  /**
   * Get connections with position information
   * @returns {Array<Object>} Array of connections with position data
   */
  getConnectionsWithPositions() {
    const connections = this.getConnections();
    return connections.map(conn => {
      const fromPos = MathUtils.getItemPosition(conn.from, this.imageCount);
      const toPos = MathUtils.getItemPosition(conn.to, this.imageCount);

      return {
        ...conn,
        fromPosition: fromPos,
        toPosition: toPos,
        distance: MathUtils.getDistance(fromPos, toPos),
        isDiagonal: MathUtils.isDiagonalPair(conn.from, conn.to, this.imageCount)
      };
    });
  }

  /**
   * External method to handle configuration changes from GSAPGalleryViewer
   * @param {string} breakpointName - New breakpoint name
   */
  handleConfigChange(breakpointName) {
    this._handleConfigChange({ name: breakpointName });
  }

  /**
   * Cleanup - remove event listeners
   */
  cleanup() {
    // No longer directly managing event listeners
    // GSAPGalleryViewer handles the coordination
    console.log('GraphManager: Cleanup completed');
  }
}