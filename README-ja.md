# 読み込み Yomikomi

> **日本語学習者向けツールキット** — 辞書・OCR・翻訳・Anki をブラウザだけで完結。拡張機能不要。サーバー不要。データは外部に送信しません。

---

## これは何？

Yomikomi は日本語を読む際の典型的な手間を解決するウェブアプリです：

1. 漫画や本のページを撮影する
2. ブラウザ上で直接 OCR を実行（Google OCR 不使用）
3. 知らない単語をタップ — 自分の辞書から訳語や漢字の読みを確認
4. 単語をお気に入りに追加
5. 繰り返す

[Yomitan](https://github.com/themoeway/yomitan) ブラウザ拡張に近いコンセプトですが、拡張機能なしで動作するため、**スマートフォンでも使えます**。iPhone では Safari の「ホーム画面に追加」でネイティブアプリのように起動できます。

---

## 機能

### 📚 辞書
- JMdict（英語・ロシア語・スペイン語・オランダ語）と漢字辞書の検索
- **カスタム SQL クエリ** — 辞書の検索ロジックを自由にカスタマイズ
- カスタム意味パーサー（JSON・プレーン文字列・カスタム JS 関数）
- **sql.js（SQLite を WASM にコンパイル）** で動作 — バックエンド不要

### 🔍 OCR
- **クライアントサイド OCR** — 画像はデバイス外に出ません
  - PaddleOcr（ONNX、推奨）
  - Tesseract.js
- **サーバーサイド OCR** — PaddleOCR または YomiToku を動かした独自の Docker コンテナに接続
- アルバム：ページを一括アップロードして全ページを処理し、辞書ルックアップ付きで閲覧
- 画像上のエリア選択で、特定範囲の精密な OCR

### 🌐 翻訳
- ブラウザ上でローカル機械翻訳モデルを実行（[@xenova/transformers](https://github.com/xenova/transformers.js)）
- 日本語 → 英語（opus-mt-ja-en）
- 日本語 → ロシア語（チェーン：ja→en→ru）
- モデルは初回ダウンロード後にキャッシュされ、オフラインで動作

### 📦 Anki
- `.apkg` ファイルをブラウザ上で直接解析
- Anki Desktop なしでデッキを閲覧

### 🔤 トークナイズ
- [Kuromoji](https://github.com/takuyaa/kuromoji.js) による形態素解析
- トークンは n-gram ルックアップで読み込み済み辞書から補完

---

## クイックスタート

### 必要環境
- Node.js 20+
- pnpm 10+

### セットアップ

```bash
git clone https://github.com/sieugene/yomikomi
cd yomikomi
pnpm install
pnpm dev
```

[http://localhost:3000](http://localhost:3000) を開く

### コマンド

```bash
pnpm dev        # 開発サーバー起動（Turbopack）
pnpm build      # 本番ビルド
pnpm start      # 本番サーバー起動
pnpm lint       # ESLint チェック
```

---

## 辞書

このアプリは [Yomichan/Yomitan](https://github.com/themoeway/yomitan) と同じ辞書フォーマットを使用します。組み込みテンプレート：

| テンプレート | 言語 | フォーマット |
|------------|------|------------|
| `jmdict_en` | 英語 | JMdict structured-content |
| `jmdict_ru` | ロシア語 | JMdict plain |
| `jmdict_es` | スペイン語 | JMdict plain |
| `jmdict_nl` | オランダ語 | JMdict plain |
| `nyars` | ロシア語 | Nyars structured-content |
| `kanji_dict` | — | 漢字 + 音読み/訓読み |

### 辞書の追加方法

1. **辞書** → 辞書管理 へ移動
2. `.db` 辞書ファイルをアップロード
3. テンプレートを選択するか、カスタム SQL クエリを設定

### カスタム SQL クエリ

検索ロジックを自由に記述できます。基本的な例：

```sql
SELECT DISTINCT *
FROM terms
WHERE "0" = ? OR "0" LIKE ? || '%'
ORDER BY CASE WHEN "0" = ? THEN 1 ELSE 2 END
LIMIT ?;
```

読み・漢字・部分一致など、あらゆる検索ロジックを書けます。

---

## OCR：クライアントサイドモード

デフォルトでは OCR は完全にブラウザ上で動作します。画像はどこにも送信されません。

**PaddleOcr（ONNX、推奨）**（推奨）— 日本語に特化した高速・高精度エンジン：
- モデル：`/public/ocr/` 内の ONNX ファイル
- 初回使用時に自動ロード

**Tesseract.js** — クラシックな選択肢、やや低速だが安定：
- 辞書ファイルは `/public/kuromoji/` に配置

OCR 設定：**設定 → OCR 設定**
- 文字方向（横書き / 縦書き / 自動）
- 日本語縦書きモード
- エンジン選択

---

## OCR：サーバーモード（Docker）

複雑なページの高品質認識のために、ローカル OCR サーバーを起動できます。

### PaddleOCR（軽量、約 2GB）

```bash
cd server
docker-compose --env-file .env.paddle up --build
```

### YomiToku（重量級、約 4GB、複雑なレイアウトに強い）

```bash
cd server
docker-compose --env-file .env.yomitoku up --build
```

サーバーは `http://localhost:8000` で動作します。アプリの設定で：
- 「クライアントサイド OCR」を無効化
- API エンドポイントを設定：`http://localhost:8000`

### サーバー API エンドポイント

```
POST /ocr/                 # 画像からテキストを抽出
POST /ocr/with-positions/  # テキストをブロック座標付きで抽出
GET  /health               # サーバーの状態確認
```

両エンジンは同じレスポンス形式を返します — フロントエンドは違いを意識しません。

---

## アルバム（バッチ OCR）

漫画や本を読む場合：

1. **アルバム** → **新しいアルバム**
2. ページをアップロード（最大 500 枚、ファイル名順でソート）
3. **処理** をクリック — OCR がバッチで実行
4. ページを閲覧し、単語をタップして辞書で調べる
5. **エリア選択** で画像の特定範囲に OCR を実行

---

## 翻訳

モデルは WebAssembly 経由でローカル実行されます（[@xenova/transformers](https://github.com/xenova/transformers.js)）。

**有効化方法：**
1. **翻訳** ページへ移動
2. 「モデルを有効化」をクリック
3. 初回ロード：30〜60 秒（以降はキャッシュ済み）

**利用可能な言語ペア：**
- 日本語 → 英語（opus-mt-ja-en）
- 日本語 → ロシア語（opus-mt-ja-en + opus-mt-en-ru）

---

## 既知の制限

### iOS / iPhone
iOS にはブラウザのメモリ制限と WebGPU サポートの問題があります。重い翻訳モデル使用時にクラッシュが発生する場合があります。
クライアントサイド Paddleocrは安定して動作しますが、メモリに関する問題が起きることがあります。

**ヒント：** Safari の「共有」→「ホーム画面に追加」でサイトを追加すると、ブラウザ UI なしでフルスクリーン表示されます。

### モバイルでの翻訳
翻訳モデルは 75〜150MB あります。メモリが限られたデバイスではクラッシュが発生する場合があります — これは iOS Safari における大きな WebAssembly/ONNX モデルに関する既知の問題です。

---

## アーキテクチャ（開発者向け）

### 技術スタック
- **Next.js 16**（App Router）+ **TypeScript**
- **Tailwind CSS v4** + Radix UI + shadcn/ui
- **sql.js** — SQLite を WASM にコンパイル、ブラウザ上で動作
- **kuromoji.js** — 日本語形態素解析器（WASM）
- **@xenova/transformers** — Hugging Face Transformers.js（ONNX Runtime Web）
- **SWR** — データフェッチと状態同期
- **IndexedDB** — アルバム・画像・辞書の保存
- **protobufjs** — Anki `.apkg` ファイルの解析

### Next.js での WASM

SSR の影響で、Next.js での WASM の扱いは一筋縄ではいきません。各依存関係の処理方法：

**sql.js** は SSR クラッシュを防ぐため、コンテキストプロバイダー（`SqlJsProvider`）内で動的インポートします。WASM バイナリは `/public/` から配信されます。

**Kuromoji** の辞書ファイルは `/public/kuromoji/` に配置し、標準の `fetch` でロードします — Kuromoji は URL ベースのロードをネイティブでサポートしています。

**@xenova/transformers** はカスタムアダプター（`/public/transformers/transformers-adapter.js`）を通じて接続し、`strategy="afterInteractive"` の `<Script>` タグとして注入します。これにより SSR の問題を回避し、`window.__transformers` はクライアント側でのみ利用可能になります。

**PaddleOcr**（ONNX Runtime Web）も同じパターンに従い、Script タグでロードし、モデルファイルは `/public/ocr/` に配置します。

**基本方針：** 重い WASM 依存関係はすべてコンテキストプロバイダーの背後に隔離し、クライアント側でのみ遅延ロードします。SSR 中には何も実行されません。

### プロジェクト構成

```
src/
├── app/                    # Next.js App Router ページ
│   └── app/
│       ├── albums/         # アルバム一覧
│       ├── album/[id]/     # アルバムビューアー
│       ├── dict/           # 辞書ページ
│       ├── translator/     # 翻訳
│       ├── ocr-capture/    # 写真からの OCR
│       ├── favorites/      # 保存済み単語
│       ├── anki-import/    # Anki インポート
│       └── settings/       # 設定
│
├── features/               # ビジネスロジック（Feature-Sliced Design）
│   ├── dictionary/         # 辞書管理、SQL 検索
│   ├── ocr/                # OCR ロジックとアダプター
│   ├── ocr-album/          # アルバム + バッチ処理
│   ├── ocr-capture/        # エリア選択 + OCR
│   ├── ocr-client/         # クライアント OCR エンジン（PaddleOcr・Tesseract）
│   ├── ocr-settings/       # OCR 設定
│   ├── translation/        # 翻訳（Transformers.js）
│   ├── tokenizer/          # Kuromoji + 辞書補完
│   ├── favorite-words/     # お気に入り単語
│   └── storage/            # BaseStoreManager（IndexedDB 抽象化）
│
├── entities/               # ビジネス対応コンポーネント
│   ├── OcrViewer/          # OCR 結果ビューアー
│   ├── DictionaryLookup/   # 辞書検索 UI
│   └── OcrCompactDictionary/
│
├── views/                  # ページコンポジション
└── shared/                 # ユーティリティ、UI キット、ルート

server/                     # Python FastAPI OCR サーバー
├── src/
│   ├── main.py
│   ├── ocr_paddle.py
│   ├── ocr_yomitoku.py
│   └── schemas/
├── Dockerfile-paddle
├── Dockerfile-yomitoku
└── docker-compose.yml
```

### データストレージ

すべてブラウザのローカルに保存されます：

| データ | ストレージ |
|--------|----------|
| アルバムと画像 | IndexedDB（`OCRAlbumDB`） |
| 辞書ファイル | IndexedDB（`DictionaryManagerDB`） |
| カスタム辞書テンプレート | localStorage |
| OCR 設定 | localStorage |
| 翻訳設定 | localStorage |
| お気に入り単語 | localStorage |
| 翻訳モデル | Browser Cache API |

### OCR パイプライン

```
画像ファイル
    │
    ├─ isClientSide=true ──► PaddleOcr (ONNX) ──► adaptPaddleOCR()
    │                    └─► Tesseract.js        ──► adaptTesseractResult()
    │
    └─ isClientSide=false ─► fetch → Docker API  ──► OCRResponse (native format)
                                          │
                               PaddleOCR / YomiToku

OCRResponse { full_text, text_blocks[], image_info }
```

すべてのソースは同じ `OCRResponse` フォーマットを返します — UI 層はどこから結果が来たかを意識しません。

---

## コントリビューション

PR や Issue 歓迎です。バグを見つけた場合やアイデアがある場合は、Issue を開いてください。

```bash
pnpm dev    # Turbopack、ホットリロード
pnpm lint   # コミット前に実行
```

---

## ライセンス

MIT
Copyright (c) 2026 sieugene