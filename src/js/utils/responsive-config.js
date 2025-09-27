/**
 * ResponsiveConfigManager - Dynamic configuration management for responsive design
 * Handles screen size detection, breakpoint management, and dynamic config calculation
 */

export const BREAKPOINTS = {
  DESKTOP: {
    name: 'desktop',
    min: 769,
    container: 600,
    center: 300,
    radius: 250,
    itemSize: 100
  },
  TABLET: {
    name: 'tablet',
    max: 768,
    min: 481,
    container: 400,
    center: 200,
    radius: 150,
    itemSize: 80
  },
  MOBILE: {
    name: 'mobile',
    max: 480,
    container: 300,
    center: 150,
    radius: 100,
    itemSize: 60
  }
};

export class ResponsiveConfigManager {
  static _cache = {};
  static _currentBreakpoint = null;
  static _resizeCallbacks = [];
  static _debounceTimer = null;
  static _isInitialized = false;

  /**
   * Initialize the responsive config manager
   */
  static init() {
    if (this._isInitialized) return;

    this._setupResizeListener();
    this._currentBreakpoint = this.getBreakpoint();
    this._isInitialized = true;
  }

  /**
   * Get current breakpoint based on window width
   * @returns {Object} Current breakpoint configuration
   */
  static getBreakpoint() {
    const width = window.innerWidth;

    if (width >= BREAKPOINTS.DESKTOP.min) {
      return BREAKPOINTS.DESKTOP;
    } else if (width >= BREAKPOINTS.TABLET.min && width <= BREAKPOINTS.TABLET.max) {
      return BREAKPOINTS.TABLET;
    } else {
      return BREAKPOINTS.MOBILE;
    }
  }

  /**
   * Get responsive configuration based on current screen size
   * @param {number} itemCount - Number of gallery items
   * @returns {Object} Dynamic configuration object
   */
  static getResponsiveConfig(itemCount = 8) {
    const breakpoint = this.getBreakpoint();
    const cacheKey = `${breakpoint.name}_${itemCount}`;

    // Return cached config if available and breakpoint hasn't changed
    if (this._cache[cacheKey] && this._currentBreakpoint?.name === breakpoint.name) {
      return this._cache[cacheKey];
    }

    // Calculate dynamic configuration
    const config = this._calculateConfig(breakpoint, itemCount);

    // Cache the result
    this._cache[cacheKey] = config;
    this._currentBreakpoint = breakpoint;

    return config;
  }

  /**
   * Calculate configuration values based on breakpoint
   * @param {Object} breakpoint - Breakpoint configuration
   * @param {number} itemCount - Number of gallery items
   * @returns {Object} Calculated configuration
   * @private
   */
  static _calculateConfig(breakpoint, itemCount) {
    return {
      // Basic layout
      radius: breakpoint.radius,
      centerX: breakpoint.center,
      centerY: breakpoint.center,
      itemSize: breakpoint.itemSize,
      itemCount: itemCount,

      // Container dimensions
      containerWidth: breakpoint.container,
      containerHeight: breakpoint.container,

      // Breakpoint info
      breakpoint: breakpoint.name,

      // Image URL pattern (maintain existing pattern)
      imageUrlPattern: "https://picsum.photos/600/600?random={index}",

      // Animation settings (scale based on container size)
      animation: {
        duration: 0.8,
        delay: 0.1,
        ease: "sine.inOut",
        modalDuration: 0.3,
        modalEase: "power2.out",
        pathStrokeDelay: 0.2,
        pathStrokeDuration: 1.5,
        itemClickScale: 0.8,
        itemClickDuration: 0.2,
        timelineOffset: 0.1,
        modalBackgroundDuration: 0.2,

        // Scaled intro animations
        introTitleOffset: -50,
        introContainerScale: 0.8,
        introContainerDelay: 0.3
      },

      // Path settings (scale stroke width based on container size)
      path: {
        strokeWidth: {
          normal: Math.max(3, Math.round(breakpoint.container / 120)), // 5 for 600px
          hover: Math.max(5, Math.round(breakpoint.container / 75))    // 8 for 600px
        },
        colors: {
          pink: '#ff6b6b',
          green: '#00ff00'
        },
        opacity: {
          normal: 0.8,
          light: 0.15,
          highlight: 1,
          lightHighlight: 0.3
        }
      },

      // Arc calculation constants
      arcHeightRatio: 0.3,
      itemDelayMultiplier: 0.1,

      // 3D perspective settings
      perspective: 1000,
      transformStyle: "preserve-3d",

      // Hover settings (adjust scale based on item size)
      hover: {
        scale: breakpoint.itemSize >= 100 ? 1.2 : 1.15, // Smaller scale for smaller items
        brightness: 1.2,
        saturation: 1.3,
        duration: 0.3,
        ease: "power2.out"
      }
    };
  }

  /**
   * Register a callback for resize events
   * @param {Function} callback - Function to call on resize
   */
  static onResize(callback) {
    if (typeof callback === 'function') {
      this._resizeCallbacks.push(callback);
    }
  }

  /**
   * Remove a resize callback
   * @param {Function} callback - Function to remove
   */
  static offResize(callback) {
    const index = this._resizeCallbacks.indexOf(callback);
    if (index > -1) {
      this._resizeCallbacks.splice(index, 1);
    }
  }

  /**
   * Setup resize event listener with debouncing
   * @private
   */
  static _setupResizeListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('resize', () => {
      // Clear existing timer
      if (this._debounceTimer) {
        clearTimeout(this._debounceTimer);
      }

      // Set new timer
      this._debounceTimer = setTimeout(() => {
        const newBreakpoint = this.getBreakpoint();

        // Only trigger callbacks if breakpoint actually changed
        if (!this._currentBreakpoint || newBreakpoint.name !== this._currentBreakpoint.name) {
          this.clearCache();
          this._currentBreakpoint = newBreakpoint;

          // Trigger all registered callbacks
          this._resizeCallbacks.forEach(callback => {
            try {
              callback(newBreakpoint);
            } catch (error) {
              console.warn('Resize callback error:', error);
            }
          });
        }
      }, 300); // 300ms debounce
    });
  }

  /**
   * Clear the configuration cache
   */
  static clearCache() {
    this._cache = {};
  }

  /**
   * Get current cached configurations (for debugging)
   * @returns {Object} Current cache contents
   */
  static getCache() {
    return { ...this._cache };
  }

  /**
   * Get current breakpoint name
   * @returns {string} Current breakpoint name
   */
  static getCurrentBreakpointName() {
    return this._currentBreakpoint?.name || this.getBreakpoint().name;
  }

  /**
   * Check if we're currently on a specific breakpoint
   * @param {string} breakpointName - Name of breakpoint to check
   * @returns {boolean} True if current breakpoint matches
   */
  static isBreakpoint(breakpointName) {
    return this.getCurrentBreakpointName() === breakpointName;
  }

  /**
   * Force recalculation of configuration
   * @param {number} itemCount - Number of gallery items
   * @returns {Object} Fresh configuration object
   */
  static forceRecalculate(itemCount = 8) {
    this.clearCache();
    return this.getResponsiveConfig(itemCount);
  }

  /**
   * Cleanup - remove event listeners and clear cache
   */
  static cleanup() {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }

    this._resizeCallbacks = [];
    this.clearCache();
    this._isInitialized = false;

    // Note: We don't remove the resize listener as it might be used by other parts
  }
}

// Auto-initialize when module is loaded
if (typeof window !== 'undefined') {
  ResponsiveConfigManager.init();
}