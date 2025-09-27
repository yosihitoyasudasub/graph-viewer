import { GALLERY_CONFIG } from '../core/config.js';
import { ResponsiveConfigManager } from './responsive-config.js';
import { MathUtils } from './math-utils.js';

export class SystemValidator {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  /**
   * Run all system validation tests
   * @returns {Object} Validation results
   */
  async runValidation() {
    console.log('SystemValidator: Starting comprehensive system validation...');

    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };

    // Core system tests
    this.testResponsiveConfigManager();
    this.testGalleryConfigProxy();
    this.testBreakpointDetection();
    this.testMathUtilsIntegration();
    this.testConfigurationDynamics();

    // Manager integration tests
    this.testManagerIntegration();

    // Event system tests
    this.testEventSystemIntegration();

    // Performance tests
    this.testPerformanceOptimizations();

    const summary = this.generateValidationSummary();
    console.log('SystemValidator: Validation completed', summary);
    return summary;
  }

  /**
   * Test ResponsiveConfigManager functionality
   */
  testResponsiveConfigManager() {
    this.addTest('ResponsiveConfigManager', () => {
      // Test initialization
      if (!ResponsiveConfigManager.isInitialized()) {
        ResponsiveConfigManager.init();
      }

      // Test breakpoint detection
      const currentBreakpoint = ResponsiveConfigManager.getCurrentBreakpoint();
      if (!currentBreakpoint || typeof currentBreakpoint !== 'string') {
        throw new Error('Breakpoint detection failed');
      }

      // Test config calculation
      const config = ResponsiveConfigManager.calculateConfig();
      const requiredProps = ['centerX', 'centerY', 'radius', 'itemSize', 'containerWidth', 'containerHeight'];

      for (const prop of requiredProps) {
        if (typeof config[prop] !== 'number' || config[prop] <= 0) {
          throw new Error(`Invalid config property: ${prop} = ${config[prop]}`);
        }
      }

      return 'ResponsiveConfigManager working correctly';
    });
  }

  /**
   * Test GALLERY_CONFIG proxy functionality
   */
  testGalleryConfigProxy() {
    this.addTest('GALLERY_CONFIG Proxy', () => {
      // Test current property access
      const current = GALLERY_CONFIG.current;
      if (!current || typeof current !== 'object') {
        throw new Error('GALLERY_CONFIG.current not accessible');
      }

      // Test dynamic property access
      const centerX = GALLERY_CONFIG.centerX;
      const centerY = GALLERY_CONFIG.centerY;
      const radius = GALLERY_CONFIG.radius;

      if (typeof centerX !== 'number' || typeof centerY !== 'number' || typeof radius !== 'number') {
        throw new Error('Dynamic property access failed');
      }

      // Test method access
      if (typeof GALLERY_CONFIG.getCurrentBreakpoint !== 'function') {
        throw new Error('Method access through proxy failed');
      }

      return 'GALLERY_CONFIG proxy working correctly';
    });
  }

  /**
   * Test breakpoint detection across different screen sizes
   */
  testBreakpointDetection() {
    this.addTest('Breakpoint Detection', () => {
      const originalWidth = window.innerWidth;

      try {
        // We can't actually change window size in tests, but we can verify logic
        const currentBreakpoint = GALLERY_CONFIG.getCurrentBreakpoint();
        const expectedBreakpoints = ['desktop', 'tablet', 'mobile'];

        if (!expectedBreakpoints.includes(currentBreakpoint)) {
          throw new Error(`Invalid breakpoint: ${currentBreakpoint}`);
        }

        // Test breakpoint consistency
        const config1 = GALLERY_CONFIG.current;
        const config2 = GALLERY_CONFIG.current;

        if (config1.breakpoint !== config2.breakpoint) {
          throw new Error('Breakpoint detection inconsistent');
        }

        return `Breakpoint detection working: ${currentBreakpoint}`;
      } catch (error) {
        throw error;
      }
    });
  }

  /**
   * Test MathUtils integration with responsive config
   */
  testMathUtilsIntegration() {
    this.addTest('MathUtils Integration', () => {
      const itemCount = 6;

      // Test position calculations
      for (let i = 0; i < itemCount; i++) {
        const position = MathUtils.getItemPosition(i, itemCount);
        const elementPosition = MathUtils.getItemElementPosition(i, itemCount);

        if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
          throw new Error(`Invalid position calculation for item ${i}`);
        }

        if (!elementPosition || typeof elementPosition.x !== 'number' || typeof elementPosition.y !== 'number') {
          throw new Error(`Invalid element position calculation for item ${i}`);
        }
      }

      // Test cache functionality
      const cacheStats = MathUtils.getCacheStats();
      if (!cacheStats || typeof cacheStats.hits !== 'number') {
        throw new Error('Cache system not working');
      }

      return 'MathUtils integration working correctly';
    });
  }

  /**
   * Test configuration dynamics and updates
   */
  testConfigurationDynamics() {
    this.addTest('Configuration Dynamics', () => {
      const config1 = GALLERY_CONFIG.current;
      const breakpoint1 = config1.breakpoint;

      // Force recalculation
      ResponsiveConfigManager.forceRecalculate();

      const config2 = GALLERY_CONFIG.current;
      const breakpoint2 = config2.breakpoint;

      // Breakpoint should remain the same if window size didn't change
      if (breakpoint1 !== breakpoint2) {
        // This might be expected if window was resized
        console.warn('Breakpoint changed during test - window may have been resized');
      }

      // Test required properties exist
      const requiredProps = ['centerX', 'centerY', 'radius', 'itemSize', 'animation', 'path'];
      for (const prop of requiredProps) {
        if (!(prop in config2)) {
          throw new Error(`Missing required property: ${prop}`);
        }
      }

      return 'Configuration dynamics working correctly';
    });
  }

  /**
   * Test manager integration
   */
  testManagerIntegration() {
    this.addTest('Manager Integration', () => {
      // Check if global gallery instance exists
      if (!window.gallery) {
        throw new Error('Global gallery instance not available - cannot test manager integration');
      }

      const gallery = window.gallery;

      // Test manager existence
      const managers = ['graphManager', 'animationManager', 'eventManager', 'pathManager'];
      for (const manager of managers) {
        if (!gallery[manager]) {
          throw new Error(`Manager not found: ${manager}`);
        }

        // Test config change method
        if (typeof gallery[manager].handleConfigChange !== 'function') {
          throw new Error(`Manager ${manager} missing handleConfigChange method`);
        }
      }

      // Test stats methods
      const stats = gallery.getStats();
      if (!stats || typeof stats.itemCount !== 'number') {
        throw new Error('Gallery stats not available');
      }

      return 'Manager integration working correctly';
    });
  }

  /**
   * Test event system integration
   */
  testEventSystemIntegration() {
    this.addTest('Event System Integration', () => {
      if (!window.gallery || !window.gallery.eventManager) {
        throw new Error('EventManager not available for testing');
      }

      const eventManager = window.gallery.eventManager;

      // Test resize status
      const resizeStatus = eventManager.getResizeStatus();
      if (!resizeStatus || typeof resizeStatus.isSetup !== 'boolean') {
        throw new Error('Resize system not properly configured');
      }

      // Test listener count
      const listenerCount = eventManager.getListenerCount();
      if (typeof listenerCount !== 'number' || listenerCount < 0) {
        throw new Error('Event listener count invalid');
      }

      return `Event system integration working: ${listenerCount} listeners active`;
    });
  }

  /**
   * Test performance optimizations
   */
  testPerformanceOptimizations() {
    this.addTest('Performance Optimizations', () => {
      // Test cache performance
      const startTime = performance.now();

      // Make multiple position calculations
      for (let i = 0; i < 50; i++) {
        MathUtils.getItemPosition(i % 6, 6);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      if (duration > 100) { // Should be very fast with caching
        console.warn(`Position calculations took ${duration}ms - may need optimization`);
      }

      // Test cache stats
      const cacheStats = MathUtils.getCacheStats();
      if (cacheStats.hits === 0) {
        throw new Error('Cache not being utilized');
      }

      return `Performance optimizations working: ${cacheStats.hits} cache hits`;
    });
  }

  /**
   * Add a test to the validation suite
   * @param {string} name - Test name
   * @param {Function} testFn - Test function
   */
  addTest(name, testFn) {
    try {
      const result = testFn();
      this.results.passed++;
      this.results.details.push({
        name,
        status: 'PASSED',
        message: result
      });
    } catch (error) {
      this.results.failed++;
      this.results.details.push({
        name,
        status: 'FAILED',
        message: error.message
      });
      console.error(`SystemValidator: Test failed - ${name}:`, error);
    }
  }

  /**
   * Generate validation summary
   * @returns {Object} Validation summary
   */
  generateValidationSummary() {
    const total = this.results.passed + this.results.failed;
    const passRate = total > 0 ? (this.results.passed / total * 100).toFixed(1) : 0;

    return {
      ...this.results,
      total,
      passRate: `${passRate}%`,
      status: this.results.failed === 0 ? 'ALL_TESTS_PASSED' : 'SOME_TESTS_FAILED'
    };
  }

  /**
   * Run a quick validation check
   * @returns {boolean} Whether system is working correctly
   */
  static async quickValidation() {
    try {
      // Quick check of core functionality
      const config = GALLERY_CONFIG.current;
      const breakpoint = GALLERY_CONFIG.getCurrentBreakpoint();

      return !!(config && config.centerX && config.centerY && breakpoint);
    } catch (error) {
      console.error('SystemValidator: Quick validation failed:', error);
      return false;
    }
  }

  /**
   * Generate detailed report
   * @returns {string} Formatted report
   */
  generateReport() {
    let report = '\n=== SYSTEM VALIDATION REPORT ===\n\n';

    report += `Total Tests: ${this.results.total}\n`;
    report += `Passed: ${this.results.passed}\n`;
    report += `Failed: ${this.results.failed}\n`;
    report += `Pass Rate: ${this.results.passRate}\n`;
    report += `Status: ${this.results.status}\n\n`;

    report += '=== TEST DETAILS ===\n';
    this.results.details.forEach(test => {
      report += `[${test.status}] ${test.name}: ${test.message}\n`;
    });

    return report;
  }
}