import { GALLERY_CONFIG } from '../core/config.js';

export class MathUtils {
  // Cache for computed positions to improve performance
  static _positionCache = new Map();
  static _lastConfig = null;

  /**
   * Clear position cache when configuration changes
   * @private
   */
  static _clearCacheIfNeeded() {
    const currentConfig = GALLERY_CONFIG.current;
    const configKey = `${currentConfig.centerX}_${currentConfig.centerY}_${currentConfig.radius}_${currentConfig.itemSize}`;

    if (this._lastConfig !== configKey) {
      this._positionCache.clear();
      this._lastConfig = configKey;
    }
  }

  /**
   * Get current responsive configuration values
   * @returns {Object} Current configuration
   * @private
   */
  static _getCurrentConfig() {
    return GALLERY_CONFIG.current;
  }

  /**
   * Calculate center position on circle for given index (for connections)
   * @param {number} index - Item index
   * @param {number} totalItems - Total number of items (defaults to config value)
   * @returns {Object} Position object {x, y}
   */
  static getItemPosition(index, totalItems) {
    this._clearCacheIfNeeded();

    const config = this._getCurrentConfig();
    const itemCount = totalItems || config.itemCount;
    const cacheKey = `pos_${index}_${itemCount}`;

    // Return cached position if available
    if (this._positionCache.has(cacheKey)) {
      return this._positionCache.get(cacheKey);
    }

    const angle = (index / itemCount) * Math.PI * 2;
    const position = {
      x: config.centerX + config.radius * Math.cos(angle),
      y: config.centerY + config.radius * Math.sin(angle)
    };

    // Cache the computed position
    this._positionCache.set(cacheKey, position);
    return position;
  }

  /**
   * Calculate element position on circle for DOM positioning (top-left corner)
   * @param {number} index - Item index
   * @param {number} totalItems - Total number of items (defaults to config value)
   * @returns {Object} Position object {x, y}
   */
  static getItemElementPosition(index, totalItems) {
    this._clearCacheIfNeeded();

    const config = this._getCurrentConfig();
    const itemCount = totalItems || config.itemCount;
    const cacheKey = `elem_${index}_${itemCount}`;

    // Return cached position if available
    if (this._positionCache.has(cacheKey)) {
      return this._positionCache.get(cacheKey);
    }

    const centerPos = this.getItemPosition(index, itemCount);
    const offset = config.itemSize / 2;
    const position = {
      x: centerPos.x - offset,
      y: centerPos.y - offset
    };

    // Cache the computed position
    this._positionCache.set(cacheKey, position);
    return position;
  }

  /**
   * Check if two indices represent diagonal pairs in a circle
   * @param {number} index1 - First index
   * @param {number} index2 - Second index
   * @param {number} totalItems - Total number of items (defaults to config value)
   * @returns {boolean} True if diagonal pair
   */
  static isDiagonalPair(index1, index2, totalItems) {
    const config = this._getCurrentConfig();
    const itemCount = totalItems || config.itemCount;
    const diff = Math.abs(index1 - index2);
    return itemCount % 2 === 0 && diff === itemCount / 2;
  }

  /**
   * Calculate angle for item position
   * @param {number} index - Item index
   * @param {number} totalItems - Total number of items
   * @returns {number} Angle in radians
   */
  static getItemAngle(index, totalItems) {
    return (index / totalItems) * Math.PI * 2;
  }

  /**
   * Calculate distance between two points
   * @param {Object} point1 - First point {x, y}
   * @param {Object} point2 - Second point {x, y}
   * @returns {number} Distance between points
   */
  static getDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Normalize a vector
   * @param {Object} vector - Vector {x, y}
   * @returns {Object} Normalized vector {x, y}
   */
  static normalizeVector(vector) {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length === 0) return { x: 0, y: 0 };

    return {
      x: vector.x / length,
      y: vector.y / length
    };
  }

  /**
   * Calculate midpoint between two points
   * @param {Object} point1 - First point {x, y}
   * @param {Object} point2 - Second point {x, y}
   * @returns {Object} Midpoint {x, y}
   */
  static getMidpoint(point1, point2) {
    return {
      x: (point1.x + point2.x) / 2,
      y: (point1.y + point2.y) / 2
    };
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Angle in degrees
   * @returns {number} Angle in radians
   */
  static degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   * @param {number} radians - Angle in radians
   * @returns {number} Angle in degrees
   */
  static radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  /**
   * Clamp a value between min and max
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Linear interpolation between two values
   * @param {number} start - Start value
   * @param {number} end - End value
   * @param {number} factor - Interpolation factor (0-1)
   * @returns {number} Interpolated value
   */
  static lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  /**
   * Calculate arc control point for curved path
   * @param {Object} point1 - Start point {x, y}
   * @param {Object} point2 - End point {x, y}
   * @param {number} heightRatio - Arc height as ratio of radius (optional)
   * @returns {Object} Control point {x, y}
   */
  static getArcControlPoint(point1, point2, heightRatio) {
    const config = this._getCurrentConfig();
    const ratio = heightRatio !== undefined ? heightRatio : config.arcHeightRatio;

    const midpoint = this.getMidpoint(point1, point2);

    const centerVector = {
      x: config.centerX - midpoint.x,
      y: config.centerY - midpoint.y
    };

    const normalizedVector = this.normalizeVector(centerVector);
    const arcHeight = config.radius * ratio;

    return {
      x: midpoint.x + normalizedVector.x * arcHeight,
      y: midpoint.y + normalizedVector.y * arcHeight
    };
  }

  /**
   * Check if a point is inside a circle
   * @param {Object} point - Point to check {x, y}
   * @param {Object} center - Circle center {x, y}
   * @param {number} radius - Circle radius
   * @returns {boolean} True if point is inside circle
   */
  static isPointInCircle(point, center, radius) {
    const distance = this.getDistance(point, center);
    return distance <= radius;
  }

  /**
   * Round number to specified decimal places
   * @param {number} value - Value to round
   * @param {number} decimals - Number of decimal places
   * @returns {number} Rounded value
   */
  static roundToDecimals(value, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  /**
   * Clear all cached positions (useful when configuration changes)
   */
  static clearCache() {
    this._positionCache.clear();
    this._lastConfig = null;
  }

  /**
   * Get cache statistics for debugging
   * @returns {Object} Cache statistics
   */
  static getCacheStats() {
    return {
      size: this._positionCache.size,
      lastConfig: this._lastConfig,
      entries: Array.from(this._positionCache.keys())
    };
  }

  /**
   * Precompute positions for all items (optimization for initial load)
   * @param {number} totalItems - Total number of items
   */
  static precomputePositions(totalItems) {
    const config = this._getCurrentConfig();
    const itemCount = totalItems || config.itemCount;

    for (let i = 0; i < itemCount; i++) {
      this.getItemPosition(i, itemCount);
      this.getItemElementPosition(i, itemCount);
    }
  }

  /**
   * Get current configuration values for external access
   * @returns {Object} Current layout configuration
   */
  static getCurrentLayoutConfig() {
    const config = this._getCurrentConfig();
    return {
      centerX: config.centerX,
      centerY: config.centerY,
      radius: config.radius,
      itemSize: config.itemSize,
      itemCount: config.itemCount,
      breakpoint: config.breakpoint
    };
  }
}