import { ResponsiveConfigManager } from '../utils/responsive-config.js';

// Legacy static configuration - maintained for backward compatibility
const STATIC_GALLERY_CONFIG = {
  // Gallery dimensions and layout (these will be overridden by responsive config)
  radius: 250,
  centerX: 300,
  centerY: 300,
  itemSize: 100,
  itemCount: 8, // ここで画像の数を設定
  imageUrlPattern: "https://picsum.photos/600/600?random={index}", // {index}が1,2,3...に置換される
  itemData: [
    {
      image: "https://picsum.photos/600/600?random=1",
      text1: "美しい風景",
      text2: "この画像は自然の美しさを表現した作品です。山々と空の調和が印象的で、見る人に平和な気持ちをもたらします。",
      text3: "風景写真",
      text4: "2024年撮影",
      text5: "撮影者: John Smith"
    },
    {
      image: "https://picsum.photos/600/600?random=2",
      text1: "都市の夜景",
      text2: "モダンな都市の夜景を捉えた一枚。光と影のコントラストが美しく、都市の躍動感を表現しています。",
      text3: "都市写真",
      text4: "2024年撮影",
      text5: "撮影者: Jane Doe"
    },
    {
      image: "https://picsum.photos/600/600?random=3",
      text1: "海辺の夕焼け",
      text2: "穏やかな海に映る夕日が美しい瞬間を切り取った作品。自然の色彩の豊かさを感じることができます。",
      text3: "自然写真",
      text4: "2024年撮影",
      text5: "撮影者: Mike Johnson"
    },
    {
      image: "https://picsum.photos/600/600?random=4",
      text1: "森の小径",
      text2: "深い森の中の小さな道。木漏れ日が作る光と影のパターンが幻想的な雰囲気を演出しています。",
      text3: "自然写真",
      text4: "2024年撮影",
      text5: "撮影者: Sarah Wilson"
    },
    {
      image: "https://picsum.photos/600/600?random=5",
      text1: "古い建築",
      text2: "歴史ある建物の細部を捉えた作品。時代を超えた美しさと職人の技術の高さを表現しています。",
      text3: "建築写真",
      text4: "2024年撮影",
      text5: "撮影者: Robert Brown"
    },
    {
      image: "https://picsum.photos/600/600?random=6",
      text1: "花畑の風景",
      text2: "色とりどりの花が咲き誇る美しい花畑。春の訪れを感じさせる生命力あふれる風景です。",
      text3: "自然写真",
      text4: "2024年撮影",
      text5: "撮影者: Emily Davis"
    },
    {
      image: "https://picsum.photos/600/600?random=7",
      text1: "山頂からの眺め",
      text2: "高い山の頂上から見下ろす壮大な景色。雲海の向こうに広がる無限の空間が印象的です。",
      text3: "風景写真",
      text4: "2024年撮影",
      text5: "撮影者: David Miller"
    },
    {
      image: "https://picsum.photos/600/600?random=8",
      text1: "街角のカフェ",
      text2: "賑やかな街角にある小さなカフェ。人々の日常の一コマを温かい視点で捉えた作品です。",
      text3: "街角写真",
      text4: "2024年撮影",
      text5: "撮影者: Lisa Garcia"
    },
    {
      image: "https://picsum.photos/600/600?random=9",
      text1: "雨上がりの街",
      text2: "雨上がりの濡れた路面に映る光が美しい都市の風景。静寂と動きのコントラストが印象的です。",
      text3: "都市写真",
      text4: "2024年撮影",
      text5: "撮影者: Mark Taylor"
    },
    {
      image: "https://picsum.photos/600/600?random=10",
      text1: "桜並木",
      text2: "満開の桜が作るピンクのトンネル。日本の春の美しさを象徴する風景を捉えました。",
      text3: "自然写真",
      text4: "2024年撮影",
      text5: "撮影者: Yuki Tanaka"
    },
    {
      image: "https://picsum.photos/600/600?random=11",
      text1: "湖面の反射",
      text2: "静かな湖面に映る山々と雲。水面が作る完璧な鏡像が自然の対称美を表現しています。",
      text3: "風景写真",
      text4: "2024年撮影",
      text5: "撮影者: Anna Kim"
    },
    {
      image: "https://picsum.photos/600/600?random=12",
      text1: "星空の夜",
      text2: "満天の星空の下の風景。宇宙の壮大さと地球の美しさを同時に感じることができる作品です。",
      text3: "天体写真",
      text4: "2024年撮影",
      text5: "撮影者: Chris Lee"
    }
  ] // 各アイテムの詳細情報
};

/**
 * Dynamic gallery configuration that adapts to screen size
 * This is the main configuration object that should be used throughout the application
 */
class GalleryConfig {
  constructor() {
    this._cache = null;
    this._itemCount = STATIC_GALLERY_CONFIG.itemCount;
    this._responsiveConfigManager = ResponsiveConfigManager;
  }

  /**
   * Get current responsive configuration
   * @returns {Object} Current configuration based on screen size
   */
  get current() {
    // Get responsive config and merge with static data
    const responsiveConfig = this._responsiveConfigManager.getResponsiveConfig(this._itemCount);

    return {
      ...responsiveConfig,
      itemData: STATIC_GALLERY_CONFIG.itemData,

      // Legacy compatibility - these properties are now dynamic
      radius: responsiveConfig.radius,
      centerX: responsiveConfig.centerX,
      centerY: responsiveConfig.centerY,
      itemSize: responsiveConfig.itemSize,
      itemCount: responsiveConfig.itemCount,
      imageUrlPattern: responsiveConfig.imageUrlPattern,

      // Static animation settings (can be overridden by responsive config)
      animation: responsiveConfig.animation,
      path: responsiveConfig.path,
      arcHeightRatio: responsiveConfig.arcHeightRatio,
      itemDelayMultiplier: responsiveConfig.itemDelayMultiplier,
      perspective: responsiveConfig.perspective,
      transformStyle: responsiveConfig.transformStyle,
      hover: responsiveConfig.hover
    };
  }

  /**
   * Update item count and refresh configuration
   * @param {number} count - New item count
   */
  setItemCount(count) {
    this._itemCount = count;
    this._cache = null; // Clear cache to force recalculation
  }

  /**
   * Get current item count
   * @returns {number} Current item count
   */
  getItemCount() {
    return this._itemCount;
  }

  /**
   * Force recalculation of configuration
   */
  refresh() {
    this._cache = null;
    this._responsiveConfigManager.clearCache();
  }

  /**
   * Get current breakpoint name
   * @returns {string} Current breakpoint name
   */
  getCurrentBreakpoint() {
    return this._responsiveConfigManager.getCurrentBreakpointName();
  }

  /**
   * Check if we're on a specific breakpoint
   * @param {string} breakpointName - Breakpoint name to check
   * @returns {boolean} True if current breakpoint matches
   */
  isBreakpoint(breakpointName) {
    return this._responsiveConfigManager.isBreakpoint(breakpointName);
  }

  /**
   * Register callback for breakpoint changes
   * @param {Function} callback - Function to call when breakpoint changes
   */
  onBreakpointChange(callback) {
    this._responsiveConfigManager.onResize(callback);
  }

  /**
   * Remove breakpoint change callback
   * @param {Function} callback - Function to remove
   */
  offBreakpointChange(callback) {
    this._responsiveConfigManager.offResize(callback);
  }
}

// Create singleton instance
const galleryConfigInstance = new GalleryConfig();

// Export the configuration object that behaves like the original GALLERY_CONFIG
// but with dynamic properties
export const GALLERY_CONFIG = new Proxy(galleryConfigInstance, {
  get(target, prop) {
    // If accessing the 'current' property or any config property, return from current config
    if (prop === 'current') {
      return target.current;
    }

    // For direct property access, delegate to current configuration
    const currentConfig = target.current;
    if (prop in currentConfig) {
      return currentConfig[prop];
    }

    // For methods, return them from the target
    if (typeof target[prop] === 'function') {
      return target[prop].bind(target);
    }

    return target[prop];
  },

  set(target, prop, value) {
    // Handle special cases
    if (prop === 'itemCount') {
      target.setItemCount(value);
      return true;
    }

    target[prop] = value;
    return true;
  }
});

export const PATH_STATES = {
  PINK_SOLID: 0,
  GREEN_SOLID: 1,
  TRANSPARENT: 2
};

export const DOM_SELECTORS = {
  galleryItems: '.gallery-item',
  modal: '#modal',
  modalImage: '#modal-image',
  closeButton: '#close-button',
  modalBackground: '.modal-background',
  connectionSvg: '#connection-svg',
  modalContent: '.modal-content',
  galleryContainer: '.gallery-container',
  galleryCircle: '.gallery-circle'
};