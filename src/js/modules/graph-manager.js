export class GraphManager {
  constructor(imageCount) {
    this.imageCount = imageCount;
    this.adjacencyMatrix = this.initializeMatrix();
    this.setupCompleteGraph();
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

    console.log('Adjacency Matrix:', this.adjacencyMatrix);
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
}