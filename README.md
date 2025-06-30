# URL短縮サービス（QRAnalytics）

## 概要
Node.js + Express + TypeScript + Prisma + PostgreSQL で構築したURL短縮サービスです。
Docker Composeでローカル開発もクラウドデプロイも簡単です。

---

## セットアップ手順（ローカル開発・本番）

### 1. リポジトリをクローン
```sh
git clone https://github.com/DaisukeHukuda/QRAnalytics.git
cd QRAnalytics
```

### 2. 環境変数ファイルを作成
- `backend/.env.example` をコピーして `backend/.env` を作成し、各値を入力
- `frontend/.env.example` も必要に応じてコピー

### 3. 開発モードで起動（ホットリロード付き）
```sh
docker compose -f docker-compose.dev.yml up -d
```
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:3001

### 4. 本番モードで起動
```sh
docker compose up -d
```
- フロントエンド・バックエンドとも本番ビルドで起動

### 5. 開発再開時
- パソコン再起動後も、上記コマンドを再実行するだけでOK

---

---

## デプロイ手順（Render/Netlify等）

### バックエンド（Render Web Service）
1. `backend/Dockerfile` がある場合は一時的にリネーム
2. Renderで「New Web Service」作成
3. Build Command: `npm install && npm run build`
4. Start Command: `npm run start`
5. 環境変数（DATABASE_URL, JWT_SECRET など）を設定
6. RenderでPostgreSQLインスタンスを作成し、DATABASE_URLをセット
7. デプロイ後、Web Shellで `npx prisma migrate deploy` を実行

### フロントエンド（Render Static Site/Netlify等）
1. Build Command: `npm run build`
2. Publish Directory: `dist`
3. APIエンドポイントはRenderのバックエンドURLを指定

---

## よくある質問
- **Q. 開発を再開したい場合は？**
  - `docker compose up -d` でOK
- **Q. データベースを初期化したい場合は？**
  - `docker compose exec backend npx prisma migrate reset`
- **Q. .env.example には何を入れる？**
  - サンプルは `backend/.env.example` を参照

---

## 開発・運用サポート
- 不明点があればGitHub IssuesやAIアシスタントにご相談ください。
