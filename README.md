# ファクトリオ QRコードメーカー

URLや文字列からQRコードを作成し、Factorioのブループリントとして出力するウェブアプリケーションです。QRコードのドットはFactorioのランプで表現されます。

## 機能

- URLや任意のテキストからQRコードを生成
- QRコードをFactorioのブループリント形式に変換
- QRコードのサイズをカスタマイズ可能
- 生成されたブループリント文字列を簡単にコピー

## 技術スタック

- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [TypeScript](https://www.typescriptlang.org/) - 型安全な JavaScript
- [TailwindCSS](https://tailwindcss.com/) - ユーティリティファーストCSSフレームワーク
- [qrcode.react](https://github.com/zpao/qrcode.react) - QRコード生成用Reactコンポーネント
- [pako](https://github.com/nodeca/pako) - zlib圧縮/解凍ライブラリ

## 使い方

1. URLまたはテキストを入力フィールドに入力します
2. 必要に応じてQRコードのサイズを調整します
3. 「ブループリントを生成」ボタンをクリックしてファクトリオのブループリントを生成します
4. 生成されたブループリントをコピーします
5. ファクトリオゲーム内でブループリントをインポートします

## 開発方法

### 前提条件

- Node.js 16.8.0 以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/factorio-qrcode-maker.git
cd factorio-qrcode-maker

# 依存関係をインストール
npm install
# または
yarn install
```

### 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認できます。

### ビルド

```bash
npm run build
# または
yarn build
```

## ライセンス

[MIT License](LICENSE)

## 注意事項

このプロジェクトはFactorioのファンプロジェクトであり、Wube Software Ltd.とは関係ありません。
# factorio-qrcode-maker
