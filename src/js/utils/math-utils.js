import { GALLERY_CONFIG } from '../core/config.js';

export class MathUtils {
  /**
   * Calculate center position on circle for given index (for connections)
   * @param {number} index - Item index
   * @param {number} totalItems - Total number of items (defaults to config value)
   * @returns {Object} Position object {x, y}
   */
  static getItemPosition(index, totalItems = GALLERY_CONFIG.itemCount) {
    const angle = (index / totalItems) * Math.PI * 2;
    return {
      x: GALLERY_CONFIG.centerX + GALLERY_CONFIG.radius * Math.cos(angle),
      y: GALLERY_CONFIG.centerY + GALLERY_CONFIG.radius * Math.sin(angle)
    };
  }

  /**
   * Calculate element position on circle for DOM positioning (top-left corner)
   * @param {number} index - Item index
   * @param {number} totalItems - Total number of items (defaults to config value)
   * @returns {Object} Position object {x, y}
   */
  static getItemElementPosition(index, totalItems = GALLERY_CONFIG.itemCount) {
    const centerPos = this.getItemPosition(index, totalItems);
    const offset = GALLERY_CONFIG.itemSize / 2;
    return {
      x: centerPos.x - offset,
      y: centerPos.y - offset
    };
  }

  /**
   * Check if two indices represent diagonal pairs in a circle
   * @param {number} index1 - First index
   * @param {number} index2 - Second index
   * @param {number} totalItems - Total number of items (defaults to config value)
   * @returns {boolean} True if diagonal pair
   */
  static isDiagonalPair(index1, index2, totalItems = GALLERY_CONFIG.itemCount) {
    const diff = Math.abs(index1 - index2);
    return totalItems % 2 === 0 && diff === totalItems / 2;
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
   * @param {number} heightRatio - Arc height as ratio of radius
   * @returns {Object} Control point {x, y}
   */
  static getArcControlPoint(point1, point2, heightRatio = GALLERY_CONFIG.arcHeightRatio) {
    const midpoint = this.getMidpoint(point1, point2);

    const centerVector = {
      x: GALLERY_CONFIG.centerX - midpoint.x,
      y: GALLERY_CONFIG.centerY - midpoint.y
    };

    const normalizedVector = this.normalizeVector(centerVector);
    const arcHeight = GALLERY_CONFIG.radius * heightRatio;

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
}