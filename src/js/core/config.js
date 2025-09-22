export const GALLERY_CONFIG = {
  // Gallery dimensions and layout
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
  ], // 各アイテムの詳細情報

  // Animation settings
  animation: {
    duration: 0.8,
    delay: 0.1,
    ease: "sine.inOut",
    modalDuration: 0.3,
    modalEase: "power2.out",

    // Specific animation timings
    pathStrokeDelay: 0.2,        // Connection line animation stagger
    pathStrokeDuration: 1.5,     // Path stroke animation duration
    itemClickScale: 0.8,         // Scale when item is clicked
    itemClickDuration: 0.2,      // Click animation duration
    timelineOffset: 0.1,         // Timeline overlap adjustment
    modalBackgroundDuration: 0.2, // Modal background fade duration

    // Page intro animations
    introTitleOffset: -50,       // Title slide offset
    introContainerScale: 0.8,    // Initial container scale
    introContainerDelay: 0.3     // Container animation delay
  },

  // Path and connection settings
  path: {
    strokeWidth: {
      normal: 5,
      hover: 8
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

  // Hover and interaction
  hover: {
    scale: 1.2,
    brightness: 1.2,
    saturation: 1.3,
    duration: 0.3,
    ease: "power2.out"
  }
};

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