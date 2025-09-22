# Graph Viewer Project

## プロジェクト概要
HTML、JavaScript、CSSで構築されたグラフビューワーWebアプリケーション

## 技術スタック
- HTML5
- CSS3
- JavaScript (ES6+)
- GSAP (GreenSock Animation Platform)

## 開発環境
- Node.js
- npm/yarn
- Git

## デプロイ
- Vercel

## コマンド

### 開発
```bash
npm run dev
```

### リント
```bash
npm run lint
```

### 型チェック
```bash
npm run typecheck
```

### テスト
```bash
npm test
```

## ディレクトリ構成
```
graph-viewer/
├── src/            # ソースコード
│   ├── js/         # JavaScript
│   ├── css/        # スタイルシート
│   └── assets/     # 画像等のアセット
├── package.json    # 依存関係
└── vercel.json     # Vercelデプロイ設定
```

## セットアップ
1. リポジトリをクローン
2. `npm install`
3. `npm run dev`

## デプロイ手順
1. Vercelアカウントにログイン
2. GitHubリポジトリを連携

git init  # ローカルフォルダをGitリポジトリに初期化
git add .
git commit -m "first commit"
git remote add origin https://github.com/yosihitoyasudasub/graph-viewer.git
git branch -M main
git push -u origin main

もしremote origin already existsエラーが出た場合は：

  git remote remove origin
  git remote add origin
  https://github.com/yosihitoyasudasub/graph-viewer.git        
  git push -u origin main
3. 自動デプロイが実行される
vercel --prod
