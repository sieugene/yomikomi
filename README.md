# 読み込み Yomikomi

> **A toolkit for Japanese learners** — dictionary, OCR, translator, and Anki right in your browser. No extensions. No servers. No data sent anywhere.

**[🇯🇵 日本語版 README はこちら](README-ja.md)**

---

## What is this?

Yomikomi is a web app that solves the typical pain of reading Japanese:

1. Take a photo of a manga or book page
2. Run it through OCR directly in the browser (no Google OCR)
3. Tap an unknown word — get the translation from your own dictionary or kanji readings
4. Add the word to favorites
5. Repeat

The idea is similar to the [Yomitan](https://github.com/themoeway/yomitan) browser extension, but works without any extension — which means it works on mobile too. On iPhone you can add it to your Home Screen and use it like a native app.

---

## Features

### 📚 Dictionary
- Search JMdict (English, Russian, Spanish, Dutch) and kanji dictionaries
- **Custom SQL queries** — full control over how your dictionary is searched
- Custom meaning parsers (JSON, plain string, custom JS function)
- Powered by **sql.js (SQLite compiled to WASM)** — no backend required

### 🔍 OCR
- **Client-side OCR** — images never leave your device
  - PaddleOcr (ONNX, recommended)
  - Tesseract.js
- **Server-side OCR** — connect your own Docker container with PaddleOCR or YomiToku
- Albums: upload a batch of pages, process them all, browse with dictionary lookup
- Area selection on images for precise OCR of specific regions

### 🌐 Translator
- Local machine translation models running in the browser ([@xenova/transformers](https://github.com/xenova/transformers.js))
- Japanese → English (opus-mt-ja-en)
- Japanese → Russian (chained: ja→en→ru)
- Models are downloaded once, cached, and work offline

### 📦 Anki
- Parse `.apkg` files directly in the browser
- Browse decks without Anki Desktop

### 🔤 Tokenization
- [Kuromoji](https://github.com/takuyaa/kuromoji.js) for morphological analysis
- Tokens are enriched from loaded dictionaries via n-gram lookup

---

## Quick Start

### Requirements
- Node.js 20+
- pnpm 10+

### Setup

```bash
git clone https://github.com/sieugene/yomikomi
cd yomikomi
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Commands

```bash
pnpm dev        # Start dev server (Turbopack)
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # ESLint check
```

---

## Dictionaries

The app works with the dictionary format used by [Yomichan/Yomitan](https://github.com/themoeway/yomitan). Built-in templates:

| Template | Language | Format |
|----------|----------|--------|
| `jmdict_en` | English | JMdict structured-content |
| `jmdict_ru` | Russian | JMdict plain |
| `jmdict_es` | Spanish | JMdict plain |
| `jmdict_nl` | Dutch | JMdict plain |
| `nyars` | Russian | Nyars structured-content |
| `kanji_dict` | — | Kanji + onyomi/kunyomi |

### Adding a dictionary

1. Go to **Dictionary** → dictionary management
2. Upload a `.db` dictionary file
3. Select a template or configure a custom SQL query

### Custom SQL queries

Full control over search logic. Basic example:

```sql
SELECT DISTINCT *
FROM terms
WHERE "0" = ? OR "0" LIKE ? || '%'
ORDER BY CASE WHEN "0" = ? THEN 1 ELSE 2 END
LIMIT ?;
```

You can write any search logic — by reading, by kanji, partial match, etc.

---

## OCR: Client-side mode

By default, OCR runs entirely in the browser. Images are never sent anywhere.

**PaddleOcr** (recommended) — fast and accurate for Japanese:
- Models: ONNX files in `/public/ocr/`
- Loaded automatically on first use

**Tesseract.js** — classic option, slower but stable:
- Dictionary files in `/public/kuromoji/`

OCR settings: **Settings → OCR Settings**
- Text orientation (horizontal / vertical / auto)
- Japanese vertical mode
- Engine selection

---

## OCR: Server mode (Docker)

For higher quality recognition of complex pages, you can run a local OCR server.

### PaddleOCR (lightweight, ~2GB)

```bash
cd server
docker-compose --env-file .env.paddle up --build
```

### YomiToku (heavier, ~4GB, better for complex layouts)

```bash
cd server
docker-compose --env-file .env.yomitoku up --build
```

The server runs on `http://localhost:8000`. In app settings:
- Disable "Client side OCR"
- Set API endpoint: `http://localhost:8000`

### Server API endpoints

```
POST /ocr/                 # Extract text from image
POST /ocr/with-positions/  # Extract text with block coordinates
GET  /health               # Server status
```

Both engines return the same response format — the frontend doesn't know the difference.

---

## Albums (batch OCR)

For reading manga or books:

1. **Albums** → **New Album**
2. Upload pages (up to 500 images, sorted by filename)
3. Click **Process** — OCR runs in batches
4. Browse pages, tap words to look them up in the dictionary
5. Use **Select Area** to run OCR on a specific region of the image

---

## Translator

Models run locally via WebAssembly ([@xenova/transformers](https://github.com/xenova/transformers.js)).

**Activation:**
1. Go to **Translator**
2. Click "Activate Models"
3. First load: 30–60 seconds (models are cached after that)

**Available pairs:**
- 日本語 → English (opus-mt-ja-en)
- 日本語 → Russian (opus-mt-ja-en + opus-mt-en-ru)

---

## Known Limitations

### iOS / iPhone
iOS has browser memory limits and WebGPU support issues. Crashes may occur when using heavy translation models. 
Client-side OCR (PaddleOcr) works stably, but can have some memory issues.

**Tip:** Add the site to your Home Screen via Safari → Share → Add to Home Screen. The app opens fullscreen without the browser UI.

### Translator on mobile
Translation models are 75–150MB. On memory-constrained devices crashes are possible — this is a known iOS Safari issue with large WebAssembly/ONNX models.

---

## Architecture (for developers)

### Tech Stack
- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + Radix UI + shadcn/ui
- **sql.js** — SQLite compiled to WASM, runs in the browser
- **kuromoji.js** — Japanese morphological analyzer (WASM)
- **@xenova/transformers** — Hugging Face Transformers.js (ONNX Runtime Web)
- **SWR** for data fetching and state synchronization
- **IndexedDB** for storing albums, images, and dictionaries
- **protobufjs** — parsing Anki `.apkg` files

### WASM in Next.js

Working with WASM in Next.js is non-trivial due to SSR. Here's how each dependency is handled:

**sql.js** is loaded via dynamic import inside a context provider (`SqlJsProvider`) to prevent SSR crashes. The WASM binary is served from `/public/`.

**Kuromoji** dictionary files are placed in `/public/kuromoji/` and loaded via standard `fetch` — Kuromoji supports URL-based loading natively.

**@xenova/transformers** is connected through a custom adapter (`/public/transformers/transformers-adapter.js`) and injected as a `<Script>` tag with `strategy="afterInteractive"`. This sidesteps SSR issues and makes `window.__transformers` available only on the client.

**PaddleOcr** (ONNX Runtime Web) follows the same pattern — loaded via Script tag, with model files in `/public/ocr/`.

**General principle:** all heavy WASM dependencies are isolated behind context providers and loaded lazily on the client only. Nothing runs during SSR.

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   └── app/
│       ├── albums/         # Album list
│       ├── album/[id]/     # Album viewer
│       ├── dict/           # Dictionary page
│       ├── translator/     # Translator
│       ├── ocr-capture/    # OCR from photo
│       ├── favorites/      # Saved words
│       ├── anki-import/    # Anki import
│       └── settings/       # Settings
│
├── features/               # Business logic (Feature-Sliced Design)
│   ├── dictionary/         # Dictionary management, SQL search
│   ├── ocr/                # OCR logic and adapters
│   ├── ocr-album/          # Albums + batch processing
│   ├── ocr-capture/        # Area selection + OCR
│   ├── ocr-client/         # Client OCR engines (PaddleOcr, Tesseract)
│   ├── ocr-settings/       # OCR settings
│   ├── translation/        # Translator (Transformers.js)
│   ├── tokenizer/          # Kuromoji + dictionary enrichment
│   ├── favorite-words/     # Favorite words
│   └── storage/            # BaseStoreManager (IndexedDB abstraction)
│
├── entities/               # Business-aware components
│   ├── OcrViewer/          # OCR result viewer
│   ├── DictionaryLookup/   # Dictionary search UI
│   └── OcrCompactDictionary/
│
├── views/                  # Page compositions
└── shared/                 # Utilities, UI kit, routes

server/                     # Python FastAPI OCR server
├── src/
│   ├── main.py
│   ├── ocr_paddle.py
│   ├── ocr_yomitoku.py
│   └── schemas/
├── Dockerfile-paddle
├── Dockerfile-yomitoku
└── docker-compose.yml
```

### Data Storage

Everything is stored locally in the browser:

| Data | Storage |
|------|---------|
| Albums and images | IndexedDB (`OCRAlbumDB`) |
| Dictionary files | IndexedDB (`DictionaryManagerDB`) |
| Custom dictionary templates | localStorage |
| OCR settings | localStorage |
| Translation settings | localStorage |
| Favorite words | localStorage |
| Translation models | Browser Cache API |

### OCR Pipeline

```
Image file
    │
    ├─ isClientSide=true ──► PaddleOcr (ONNX) ──► adaptPaddleOCR()
    │                    └─► Tesseract.js        ──► adaptTesseractResult()
    │
    └─ isClientSide=false ─► fetch → Docker API  ──► OCRResponse (native format)
                                          │
                               PaddleOCR / YomiToku

OCRResponse { full_text, text_blocks[], image_info }
```

All sources return the same `OCRResponse` format — the UI layer doesn't know or care where the result came from.

---

## Contributing

PRs and issues are welcome. If you found a bug or have an idea, open an Issue.

```bash
pnpm dev    # Turbopack, hot reload
pnpm lint   # Run before committing
```

---

## License

MIT
Copyright (c) 2026 sieugene