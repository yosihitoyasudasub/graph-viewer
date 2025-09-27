# Graph Viewer Project

## バイブコーディングルール
"noncode"　がプロンプト文末に含まれているときは、コードは作成しないでください。かつ実装もしないでください。

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

### リント
```bash
npm run lint
```

### 型チェック
```bash
npm run typecheck
```

### テスト

## ディレクトリ構成
```
graph-viewer/
├── src/            # ソースコード
│   ├── js/         # JavaScript
│   ├── css/        # スタイルシート
│   └── assets/     # 画像等のアセット
├── package.json    # 依存関係
├── vercel.json     # Vercelデプロイ設定
└── index.html      # index.html
```

## セットアップ
1. リポジトリをクローン

## デプロイ手順
1. Vercelアカウントにログイン
2. GitHubリポジトリを連携

git init  # ローカルフォルダをGitリポジトリに初期化
git add .
git commit -m "first commit"
git remote add origin https://github.com/xxx
git branch -M main
git push -u origin main

もしremote origin already existsエラーが出た場合は：

  git remote remove origin
  git remote add origin
  https://github.com/xxx
  git push -u origin main

3. 自動デプロイが実行される
vercel --prod
