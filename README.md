# 🚀 TUSD - TUS Protocol File Upload Manager

TUS プロトコルを使用した再開可能なファイルアップロード機能を実装したサンプルアプリケーションです。

**フロントエンド**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui  
**バックエンド**: Go 1.25 + Echo + tusd  
**ストレージ**: Minio (S3互換)  
**オーケストレーション**: Docker Compose

---

## 📋 必要要件

- **Docker** 20.10+ 
- **Docker Compose** 2.0+
- **Node.js** 20.x (ローカル開発時)
- **Go** 1.25 (ローカル開発時)

---

## 🏗️ プロジェクト構造

```
tusd-practice/
├── frontend/              # Next.js アプリケーション
│   ├── app/               # App Router (Next.js 15)
│   ├── components/        # React コンポーネント
│   ├── lib/               # ユーティリティ関数
│   ├── package.json       # 依存パッケージ
│   ├── tailwind.config.ts # Tailwind設定
│   └── Dockerfile         # フロントエンド用コンテナイメージ
├── backend/               # Go バックエンド
│   ├── main.go            # メインサーバー
│   ├── go.mod             # Go依存パッケージ
│   └── Dockerfile         # バックエンド用コンテナイメージ
├── docker-compose.yml     # Docker Compose オーケストレーション
└── README.md              # このファイル
```

---

## 🚀 クイックスタート

### 1. Docker Compose で全サービスを起動

```bash
docker-compose up --build
```

初回ビルド時は数分かかります。以下のように表示されたら起動完了です：

```
frontend_1  | > tusd-frontend@0.1.0 start
frontend_1  | > next start
frontend_1  | > Ready in 2.5s

backend_1   | Backend server starting on :8080
```

### 2. アプリケーションにアクセス

| サービス | URL | アカウント |
|---------|-----|----------|
| **フロントエンド** | http://localhost:3000 | - |
| **バックエンド API** | http://localhost:8080 | - |
| **Minio コンソール** | http://localhost:9001 | minioadmin/minioadmin |

---

## 📝 API エンドポイント

### ヘルスチェック
```bash
GET /health
# レスポンス: {"status":"ok"}
```

### ファイルアップロード (TUS プロトコル)
```bash
# TUS プロトコルエンドポイント
POST   /files/*  # ファイルアップロード開始
PATCH  /files/*  # アップロード続行 (再開)
HEAD   /files/*  # アップロード状態確認
DELETE /files/*  # アップロード削除
```

### アップロード済みファイル一覧
```bash
GET /uploads
# レスポンス:
[
  {
    "name": "document.pdf",
    "size": "2048576"
  },
  ...
]
```

### ファイルダウンロード
```bash
GET /download/:filename
# ファイルがダウンロード開始
```

---

## 🎨 フロントエンド機能

### ✨ 主な特徴

- **ドラッグ&ドロップ**: ファイルをドラッグしてアップロード
- **複数ファイル対応**: 複数ファイルの同時アップロード
- **進捗表示**: アップロード進捗をリアルタイム表示
- **再開機能**: インターネット接続が切れても再開可能
- **高速化**: TUS プロトコルによるチャンク分割アップロード
- **ファイル管理**: アップロード済みファイルの表示・ダウンロード

### コンポーネント一覧

| コンポーネント | 説明 |
|--------------|------|
| `FileUploader` | ファイル選択・アップロード UI |
| `ProgressBar` | アップロード進捗バー |
| `UploadList` | アップロード済みファイル一覧 |

---

## ⚙️ バックエンド機能

### 🔧 実装内容

- **Echo フレームワーク**: 軽量で高速な HTTP サーバー
- **tusd**: TUS プロトコル実装
- **Minio**: S3互換のオブジェクトストレージ
- **CORS対応**: クロスオリジンリクエスト対応
- **エラーハンドリング**: エレガントなエラー処理

### バックエンド構成

```go
// メインエンドポイント
GET  /health              // ヘルスチェック
GET  /uploads             // ファイル一覧取得
ANY  /files/*             // TUS プロトコル
GET  /download/:filename  // ファイルダウンロード
```

---

## 💾 ストレージ (Minio)

### 初期設定

- **エンドポイント**: `minio:9000`
- **アクセスキー**: `minioadmin`
- **シークレットキー**: `minioadmin`
- **バケット名**: `uploads`

### Minio コンソールアクセス

1. ブラウザで http://localhost:9001 にアクセス
2. ユーザー名: `minioadmin`
3. パスワード: `minioadmin`

アップロードされたファイルは `uploads` バケットに保存されます。

---

## 🔄 ローカル開発

### フロントエンドのみ開発

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

### バックエンドのみ開発

```bash
cd backend
go mod download
go run main.go
# http://localhost:8080
```

**注意**: Minio は Docker で起動が必要です。

```bash
docker-compose up minio
```

---

## 📊 TUS プロトコル について

TUS (Tus Resumable Upload Protocol) は以下の利点があります：

- ✅ **再開可能**: 中断したアップロードを再開可能
- ✅ **チャンク分割**: 大きなファイルを効率的にアップロード
- ✅ **プログレス表示**: アップロード進捗をリアルタイム把握
- ✅ **クロスブラウザ**: すべてのモダンブラウザで動作
- ✅ **標準仕様**: RFC に基づく標準プロトコル

---

## 🐛 トラブルシューティング

### コンテナが起動しない

```bash
# ログを確認
docker-compose logs -f

# コンテナを再起動
docker-compose restart

# 完全にクリーンアップ
docker-compose down -v
docker-compose up --build
```

### ファイルがアップロードされない

1. バックエンド API が起動しているか確認:
   ```bash
   curl http://localhost:8080/health
   ```

2. Minio が起動しているか確認:
   ```bash
   curl http://localhost:9000/minio/health/live
   ```

3. ネットワークを確認:
   ```bash
   docker network ls
   docker network inspect tusd-practice_tusd-network
   ```

### ポート競合エラー

別のアプリケーションがポートを使用している場合:

```bash
# macOS/Linux
lsof -i :3000
lsof -i :8080
lsof -i :9000

# ポートを変更 (docker-compose.yml)
# ports:
#   - "3001:3000"  # 3000 → 3001
```

---

## 📈 パフォーマンス最適化

### アップロード最大サイズ

現在の設定: **5GB**

変更方法 (backend/main.go):
```go
MaxSize: 5 * 1024 * 1024 * 1024, // 5GB
```

### チャンクサイズ

フロントエンド (components/FileUploader.tsx) で調整可能

---

## 🚀 本番環境へのデプロイ

### 1. 環境変数を設定

```bash
# backend
export MINIO_ENDPOINT=your-s3-endpoint
export MINIO_ACCESS_KEY=your-access-key
export MINIO_SECRET_KEY=your-secret-key
export MINIO_USE_SSL=true
```

### 2. Docker イメージをビルド

```bash
docker build -t your-registry/tusd-backend:latest ./backend
docker build -t your-registry/tusd-frontend:latest ./frontend
```

### 3. Kubernetes や ECS 等で デプロイ

---

## 📚 技術スタック

### フロントエンド
- **Next.js 15**: React フレームワーク
- **React 19**: UI ライブラリ
- **TypeScript**: 型安全性
- **Tailwind CSS**: ユーティリティ CSS
- **tus-js-client**: TUS クライアント
- **Axios**: HTTP クライアント

### バックエンド
- **Go 1.25**: プログラミング言語
- **Echo**: HTTP フレームワーク
- **tusd/v2**: TUS プロトコル実装
- **minio-go/v7**: Minio SDK

### インフラ
- **Docker**: コンテナ化
- **Docker Compose**: オーケストレーション
- **Minio**: S3互換ストレージ

---

## 📄 ライセンス

このプロジェクトは学習・デモンストレーション目的です。

---

## 🤝 サポート

問題が発生した場合:

1. ログを確認: `docker-compose logs`
2. コンテナを再起動: `docker-compose restart`
3. 完全にリセット: `docker-compose down -v && docker-compose up --build`

---

## 🎯 次のステップ

- [ ] 認証機能の追加
- [ ] S3 本番環境への統合
- [ ] ファイルバリデーション
- [ ] ウイルススキャン機能
- [ ] ファイル削除機能
- [ ] 複数ファイルの一括操作
- [ ] データベース統合 (アップロード履歴)
- [ ] テスト (Unit, E2E)

---

**作成日**: 2025年11月2日  
**バージョン**: 1.0.0
