class GSAPGalleryViewer {
    constructor() {
        this.galleryItems = document.querySelectorAll('.gallery-item');
        this.modal = document.getElementById('modal');
        this.modalImage = document.getElementById('modal-image');
        this.closeButton = document.getElementById('close-button');
        this.modalBackground = document.querySelector('.modal-background');
        this.connectionSvg = document.getElementById('connection-svg');
        this.connectionLines = [];

        // 円形配置の設定
        this.radius = 250;
        this.centerX = 300;
        this.centerY = 300;

        this.setupGraphMatrix();

        this.init();
    }

    // 対角要素かどうかを判定する関数（要素数に対応）
    isDiagonalPair(index1, index2) {
        const totalItems = this.galleryItems.length;
        const diff = Math.abs(index1 - index2);
        // 偶数の要素数の場合のみ対角要素が存在
        return totalItems % 2 === 0 && diff === totalItems / 2;
    }

    // 円形配置上の座標を取得（要素数に対応）
    getItemPosition(index) {
        const totalItems = this.galleryItems.length;
        const angle = (index / totalItems) * Math.PI * 2;
        return {
            x: this.centerX + this.radius * Math.cos(angle),
            y: this.centerY + this.radius * Math.sin(angle)
        };
    }

    // 直線パスのd属性を生成
    createLinearPath(pos1, pos2) {
        return `M ${pos1.x} ${pos1.y} L ${pos2.x} ${pos2.y}`;
    }

    // 円弧パス（中心向き凸形状）のd属性を生成
    createArcPath(pos1, pos2) {
        // 2点の中点を計算
        const midX = (pos1.x + pos2.x) / 2;
        const midY = (pos1.y + pos2.y) / 2;

        // 中心に向かうベクトルを計算
        const centerVectorX = this.centerX - midX;
        const centerVectorY = this.centerY - midY;
        const centerDistance = Math.sqrt(centerVectorX * centerVectorX + centerVectorY * centerVectorY);

        // 正規化
        const normalizedX = centerVectorX / centerDistance;
        const normalizedY = centerVectorY / centerDistance;

        // 制御点を中心方向に配置（円弧の高さを調整）
        const arcHeight = this.radius * 0.3;
        const controlX = midX + normalizedX * arcHeight;
        const controlY = midY + normalizedY * arcHeight;

        // 二次ベジエ曲線でパスを作成
        return `M ${pos1.x} ${pos1.y} Q ${controlX} ${controlY} ${pos2.x} ${pos2.y}`;
    }

    init() {
        this.setup3DPerspective();
        this.setupCircularLayout();
        this.setupEventListeners();
        this.animateGalleryItems();
    }

    // 3D効果のための設定
    setup3DPerspective() {
        gsap.set('.gallery-container', {
            perspective: 1000
        });

        gsap.set('.gallery-item', {
            transformStyle: "preserve-3d"
        });

        // 各カードの変形基準点をカード中心に設定
        this.galleryItems.forEach((item) => {
            gsap.set(item, {
                transformOrigin: "center center"
            });
        });
    }

    setupGraphMatrix() {
        const imageCount = this.galleryItems.length;

        // 隣接行列を初期化（imageCount x imageCount の2次元配列）
        this.adjacencyMatrix = Array(imageCount).fill(null).map(() => Array(imageCount).fill(0));

        // 対角要素は0に設定（自己ループなし）
        for (let i = 0; i < imageCount; i++) {
            this.adjacencyMatrix[i][i] = 0;
        }

        // 完全グラフの接続を仮で定義（対角要素0、それ以外すべて1）
        // すべての画像同士を接続（自己ループなし）
        // 実際には、接続情報を与えて隣接行列を作成する
        for (let i = 0; i < imageCount; i++) {
            for (let j = i + 1; j < imageCount; j++) {
                this.addEdge(i, j);
            }
        }

        console.log('Adjacency Matrix:', this.adjacencyMatrix);
    }

    // 無向グラフの辺を追加するヘルパーメソッド
    addEdge(i, j) {
        if (i !== j && i >= 0 && j >= 0 && i < this.adjacencyMatrix.length && j < this.adjacencyMatrix.length) {
            this.adjacencyMatrix[i][j] = 1;
            this.adjacencyMatrix[j][i] = 1; // 無向グラフなので対称
        }
    }

    setupCircularLayout() {
        const centerX = 300;
        const centerY = 300;

        // すべてのアイテムを中央に配置（初期状態）
        this.galleryItems.forEach((item, index) => {
            gsap.set(item, {
                x: centerX - 50,
                y: centerY - 50,
                rotation: 0,
                scale: 0
            });
        });
    }

    animateGalleryItems() {
        const radius = 250;
        const centerX = 300;
        const centerY = 300;
        const totalItems = this.galleryItems.length;

        this.galleryItems.forEach((item, index) => {
            // 最終的な円周上の位置を計算
            const angle = (index / totalItems) * Math.PI * 2;
            const finalX = centerX + radius * Math.cos(angle) - 50;
            const finalY = centerY + radius * Math.sin(angle) - 50;

            gsap.to(item, {
                x: finalX,
                y: finalY,
                scale: 1,
                duration: 0.8,
                delay: index * 0.1,
                ease: "sine.inOut",
                onComplete: () => {
                    this.addHoverAnimation(item);
                    if (index === this.galleryItems.length - 1) {
                        this.setupConnectionLine();
                    }
                }
            });
        });
    }

    setupConnectionLine() {
        this.createConnectionLines();
        this.animateConnectionLines();
    }

    createConnectionLines() {
        // 隣接行列から接続を生成（上三角部分のみをチェック）
        for (let i = 0; i < this.adjacencyMatrix.length; i++) {
            for (let j = i + 1; j < this.adjacencyMatrix[i].length; j++) {
                if (this.adjacencyMatrix[i][j] === 1) {
                    this.createSingleLine(i, j);
                }
            }
        }
    }

    createSingleLine(index1, index2) {
        // 円形配置上の理論座標を使用
        const pos1 = this.getItemPosition(index1);
        const pos2 = this.getItemPosition(index2);

        let pathElement;
        let pathData;

        // 対角要素かどうかで分岐
        if (this.isDiagonalPair(index1, index2)) {
            // 直線の場合
            pathData = this.createLinearPath(pos1, pos2);
        } else {
            // 円弧の場合
            pathData = this.createArcPath(pos1, pos2);
        }

        // SVG path要素を作成
        pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement.setAttribute('class', 'connection-line');
        pathElement.setAttribute('d', pathData);
        pathElement.setAttribute('fill', 'none');
        pathElement.setAttribute('stroke', '#ff6b6b');
        pathElement.setAttribute('stroke-width', '5');
        pathElement.setAttribute('opacity', '0.8');
        pathElement.setAttribute('data-from', index1);
        pathElement.setAttribute('data-to', index2);

        // パスクリックイベントを追加
        pathElement.style.cursor = 'pointer';
        pathElement.style.pointerEvents = 'auto';  // SVGのpointer-events: noneを上書き
        pathElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePathState(pathElement);
        });

        // パスホバーアニメーションを追加
        this.addPathHoverAnimation(pathElement);

        this.connectionSvg.appendChild(pathElement);
        this.connectionLines.push({
            element: pathElement,
            from: index1,
            to: index2,
            state: 0  // 0=実線, 1=点線, 2=透明
        });
    }

    animateConnectionLines() {
        this.connectionLines.forEach((lineData, index) => {
            const pathElement = lineData.element;

            // path要素の場合はgetTotalLength()を使用
            const length = pathElement.getTotalLength();

            gsap.set(pathElement, {
                strokeDasharray: `${length} ${length}`,
                strokeDashoffset: length
            });

            gsap.to(pathElement, {
                strokeDashoffset: 0,
                duration: 1.5,
                ease: "power2.out",
                delay: 0.5 + index * 0.2
            });
        });
    }

    addHoverAnimation(item) {
        const img = item.querySelector('img');
        const index = Array.from(this.galleryItems).indexOf(item);

        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                scale: 1.2,
                duration: 0.3,
                ease: "power2.out"
            });

            gsap.to(img, {
                filter: "brightness(1.2) saturate(1.3)",
                duration: 0.3
            });

            // 接続された線をハイライト
            this.connectionLines.forEach(lineData => {
                if (lineData.from === index || lineData.to === index) {
                    // 状態2（薄い透明）の場合はハイライトしない
                    if (lineData.state === 2) {
                        gsap.to(lineData.element, {
                            strokeWidth: 8,
                            opacity: 0.3,  // 薄い透明だが少し見やすく
                            duration: 0.3
                        });
                    } else {
                        gsap.to(lineData.element, {
                            strokeWidth: 8,
                            opacity: 1,
                            duration: 0.3
                        });
                    }
                }
            });
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });

            gsap.to(img, {
                filter: "brightness(1) saturate(1)",
                duration: 0.3
            });

            // 線を元の状態に戻す
            this.connectionLines.forEach(lineData => {
                if (lineData.from === index || lineData.to === index) {
                    // 状態に応じた適切な透明度を設定
                    const targetOpacity = lineData.state === 2 ? 0.15 : 0.8;
                    gsap.to(lineData.element, {
                        strokeWidth: 5,
                        opacity: targetOpacity,
                        duration: 0.3
                    });
                }
            });
        });
    }

    setupEventListeners() {
        this.galleryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.openModal(e.currentTarget);
            });
        });

        this.closeButton.addEventListener('click', () => {
            this.closeModal();
        });

        this.modalBackground.addEventListener('click', () => {
            this.closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

    }

    openModal(item) {
        const imageUrl = item.getAttribute('data-image');
        this.modalImage.src = imageUrl;

        gsap.set(this.modal, { display: 'block' });
        gsap.set(this.modalBackground, { opacity: 0 });
        gsap.set('.modal-content', {
            opacity: 0,
            scale: 1,
            rotation: 0,
            x: '-50%',
            y: '-50%',
            xPercent: 0,
            yPercent: 0
        });

        const tl = gsap.timeline();

        tl.to(this.modalBackground, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out"
        })
        .to('.modal-content', {
            opacity: 1,
            x: '-50%',
            y: '-50%',
            duration: 0.3,
            ease: "power2.out"
        }, "-=0.1");

        gsap.to(item, {
            scale: 0.8,
            duration: 0.2,
            ease: "power2.inOut",
            onComplete: () => {
                gsap.to(item, {
                    scale: 1,
                    duration: 0.2,
                    ease: "power2.out"
                });
            }
        });
    }

    closeModal() {
        const tl = gsap.timeline();

        tl.to('.modal-content', {
            scale: 0.5,
            opacity: 0,
            rotation: 10,
            duration: 0.3,
            ease: "power2.in"
        })
        .to(this.modalBackground, {
            opacity: 0,
            duration: 0.2,
            ease: "power2.in"
        }, "-=0.1")
        .set(this.modal, { display: 'none' });
    }

    togglePathState(pathElement) {
        // 対応するconnectionLines配列の要素を検索
        const lineData = this.connectionLines.find(line => line.element === pathElement);
        if (!lineData) return;

        // 状態をサイクル: 0→1→2→0
        lineData.state = (lineData.state + 1) % 3;

        // 状態に応じた視覚変更を適用
        this.applyPathVisualState(lineData);
    }

    applyPathVisualState(lineData) {
        const element = lineData.element;

        switch(lineData.state) {
            case 0: // 実線 + 不透明（ピンク色）
                element.removeAttribute('stroke-dasharray');
                element.style.stroke = '#ff6b6b';
                gsap.to(element, {
                    opacity: 0.8,
                    duration: 0.3,
                    ease: "power2.out"
                });
                break;

            case 1: // 緑色の実線 + 不透明
                element.removeAttribute('stroke-dasharray');
                element.style.stroke = '#00ff00';
                gsap.to(element, {
                    opacity: 0.8,
                    duration: 0.3,
                    ease: "power2.out"
                });
                break;

            case 2: // 実線 + 薄い透明（かすかに見える）
                element.removeAttribute('stroke-dasharray');
                element.style.stroke = '#ff6b6b';
                gsap.to(element, {
                    opacity: 0.15,
                    duration: 0.3,
                    ease: "power2.out"
                });
                break;
        }
    }

    addPathHoverAnimation(pathElement) {
        pathElement.addEventListener('mouseenter', () => {
            // パスを太くし、カーソルを指ポインターに変更
            gsap.to(pathElement, {
                strokeWidth: 8,
                duration: 0.3,
                ease: "power2.out"
            });
            pathElement.style.cursor = 'pointer';
        });

        pathElement.addEventListener('mouseleave', () => {
            // パスを元の太さに戻す
            gsap.to(pathElement, {
                strokeWidth: 5,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const gallery = new GSAPGalleryViewer();

    gsap.from('h1', {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
    });

    gsap.from('.gallery-container', {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "power2.out"
    });
});