// ResponsiveConfigManager テスト用スクリプト
// ブラウザのコンソールで実行可能

console.log('=== ResponsiveConfigManager Test ===');

// Import and test ResponsiveConfigManager
import('./src/js/utils/responsive-config.js').then(module => {
  const { ResponsiveConfigManager, BREAKPOINTS } = module;

  console.log('1. ブレークポイント定義:', BREAKPOINTS);
  console.log('2. 現在のブレークポイント:', ResponsiveConfigManager.getBreakpoint());
  console.log('3. 現在の設定:', ResponsiveConfigManager.getResponsiveConfig(8));
  console.log('4. キャッシュ状態:', ResponsiveConfigManager.getCache());

  // 画面サイズを変更してテスト
  console.log('\n=== 画面サイズ変更テスト ===');

  // デスクトップサイズをシミュレート
  Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
  console.log('デスクトップ (1024px):', ResponsiveConfigManager.forceRecalculate(8));

  // タブレットサイズをシミュレート
  Object.defineProperty(window, 'innerWidth', { value: 768, configurable: true });
  console.log('タブレット (768px):', ResponsiveConfigManager.forceRecalculate(8));

  // モバイルサイズをシミュレート
  Object.defineProperty(window, 'innerWidth', { value: 480, configurable: true });
  console.log('モバイル (480px):', ResponsiveConfigManager.forceRecalculate(8));

  // 元の画面サイズに戻す
  Object.defineProperty(window, 'innerWidth', { value: screen.width, configurable: true });
  console.log('元のサイズに復元');

}).catch(error => {
  console.error('ResponsiveConfigManagerの読み込みエラー:', error);
});

// GALLERY_CONFIG のテスト
import('./src/js/core/config.js').then(module => {
  const { GALLERY_CONFIG } = module;

  console.log('\n=== GALLERY_CONFIG テスト ===');
  console.log('1. 現在の設定:', GALLERY_CONFIG.current);
  console.log('2. centerX:', GALLERY_CONFIG.centerX);
  console.log('3. centerY:', GALLERY_CONFIG.centerY);
  console.log('4. radius:', GALLERY_CONFIG.radius);
  console.log('5. itemSize:', GALLERY_CONFIG.itemSize);
  console.log('6. ブレークポイント:', GALLERY_CONFIG.getCurrentBreakpoint());

}).catch(error => {
  console.error('GALLERY_CONFIGの読み込みエラー:', error);
});