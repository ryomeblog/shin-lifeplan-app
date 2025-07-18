# ライフプラン管理アプリ

- Qiita記事: [ライフプラン管理アプリ開発まとめ](https://qiita.com/ryome/items/a1327d629e7774eb83a2)
- Webサイト：[shin-lifeplan-app](https://ryomeblog.github.io/shin-lifeplan-app/)

## 概要

家計・資産・FIRE計画を一元管理できるライフプランアプリです。家族構成、口座、資産、収支カテゴリ、テンプレート、年次イベントなどを柔軟に管理し、将来の資産推移やFIRE達成シミュレーションを可視化します。

## 主な特徴

- 年単位のライフプラン設計
- 家族・口座・資産・カテゴリの自由な追加・編集
- 年次イベント・取引テンプレートによる自動記録
- 資産推移・収支グラフ表示（Recharts）
- FIRE目標・達成シミュレーション
- データはローカルストレージ保存（バックアップ・リストア対応）
- Atomic Design＋Feature-based Architectureによる高い保守性

## 画面イメージ

`doc/svg/`配下に各画面のSVGイメージあり

- ダッシュボード
- 家族・口座・資産管理
- 年次レポート
- FIRE設定
- テンプレート・イベント管理

## 技術スタック

- React
- Zustand（状態管理）
- Tailwind CSS（UI）
- Recharts（グラフ表示）
- react-router-dom
- ESLint / Prettier
- Storybook
- clsx

## フォルダ構成

```
shin-lifeplan-app/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   └── pages/
│   ├── utils/
│   ├── index.css
│   └── index.js
├── doc/
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

詳細は [`doc/フォルダ構成.md`](doc/フォルダ構成.md) を参照。

## セットアップ

1. リポジトリをクローン

   ```bash
   git clone https://github.com/yourname/shin-lifeplan-app.git
   cd shin-lifeplan-app
   ```

2. 依存パッケージインストール

   ```bash
   npm install
   ```

3. 開発サーバー起動

   ```bash
   npm start
   ```

4. ブラウザで `http://localhost:3000` を開く

## コーディング規約・設計方針

- [コーディング規約](doc/コーディング規約.md)
- [データ設計](doc/データ設計.md)
- [使用ライブラリ](doc/使用ライブラリ.md)
- [画面イメージ](doc/svg/)
