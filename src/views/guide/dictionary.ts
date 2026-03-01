export const dictionary = {
  en: {
    backToOcr: "Back to Albums",
    badgeText: "Guide",
    title: "How to Use Yomikomi",
    subtitle:
      "From zero to reading Japanese manga on your phone — follow these steps.",
    steps: [
      {
        number: "01",
        title: "Set up your dictionary",
        description:
          "Go to Dictionary → dictionary management and upload a .db dictionary file (JMdict format) or click on 'Get Recommended Dictionaries'. Select a template like jmdict_en for English, jmdict_ru for Russian, etc. This is required for word lookups.",
        color: "from-blue-500 to-cyan-500",
        tip: "You can find pre-built JMdict .db files compatible with Yomichan/Yomitan.",
      },
      {
        number: "02",
        title: "Create an album",
        description:
          'Click "New Album", give it a name, then drag and drop your images — pages from a manga, photos of a book, anything with Japanese text. The app supports up to 500 images per album, sorted by filename.',
        color: "from-violet-500 to-purple-500",
        tip: "Name your files with leading zeros (page_001.jpg, page_002.jpg) so they sort correctly.",
      },
      {
        number: "03",
        title: "Run OCR on your pages",
        description:
          'Click "Process" to run OCR across all pages in batches. By default, PaddleOCR runs entirely in your browser — no images are sent anywhere. For specific regions, use the "Select Area" tool on any page.',
        color: "from-orange-500 to-red-500",
        tip: "First run downloads the ONNX model files (~30–60s). After that, OCR is instant and works offline.",
      },
      {
        number: "04",
        title: "Tap words to look them up",
        description:
          "Open any processed page in the album viewer. Tap or click on any word in the OCR result to instantly look it up in your loaded dictionary. You'll see readings, meanings, and example usage.",
        color: "from-emerald-500 to-green-500",
        tip: "The tokenizer (Kuromoji) breaks text into individual words automatically, so you tap single words, not whole sentences.",
      },
      {
        number: "05",
        title: "Save words to favorites",
        description:
          "Found a word worth remembering? Hit the star icon to save it to your Favorites page. You can add personal notes to each saved word and search through your collection later.",
        color: "from-yellow-500 to-orange-500",
        tip: "Your favorites are stored in localStorage — they persist across sessions but stay on your device.",
      },
      {
        number: "06",
        title: "Translate with local AI models",
        description:
          'Go to Translator and click "Activate Models". The app downloads opus-mt translation models (75–150MB, cached after first load) and runs them locally via WebAssembly.',
        color: "from-pink-500 to-rose-500",
        tip: "Translation models work offline after the initial download. On iOS, avoid using them on memory-constrained devices.",
      },
    ],
    extraFeaturesTitle: "More features",
    extras: [
      {
        title: "Add to iPhone Home Screen",
        description:
          "In Safari, tap Share → Add to Home Screen. The app opens fullscreen without browser UI, behaving like a native app.",
      },
      {
        title: "Import Anki decks",
        description:
          "Go to Anki Import and upload a .apkg file. The app parses it entirely in the browser using sql.js (SQLite/WASM) — no Anki Desktop required.",
      },
      {
        title: "Simple Reader for quick text",
        description:
          "Paste any Japanese sentence into the Simple Reader for instant word-by-word analysis with dictionary lookups — no images needed.",
      },
      {
        title: "Server-side OCR (advanced)",
        description:
          "For better OCR quality on complex layouts, run the Docker backend (PaddleOCR or YomiToku). Disable Client-side OCR in Settings and point the API to http://localhost:8000.",
      },
    ],
    ctaText: "Ready to start extracting Japanese text?",
    ctaButton: "Go to Albums",
  },
  ja: {
    backToOcr: "OCRツールに戻る",
    badgeText: "ガイド",
    title: "Yomikomiの使い方",
    subtitle:
      "ゼロから始めて、スマホで日本語マンガを読めるようになるまで——以下のステップに従ってください。",
    steps: [
      {
        number: "01",
        title: "辞書をセットアップする",
        description:
          "辞書→辞書管理に移動し、.db辞書ファイル（JMdict形式）をアップロードするか、「推奨辞書を取得」をクリックします。英語ならjmdict_en、ロシア語ならjmdict_ruなどのテンプレートを選択してください。単語検索に必要です。",
        color: "from-blue-500 to-cyan-500",
        tip: "Yomichan/Yomitanに対応した事前構築済みのJMdict .dbファイルが見つかります。",
      },
      {
        number: "02",
        title: "アルバムを作成する",
        description:
          "「新規アルバム」をクリックして名前を付け、画像をドラッグ&ドロップします——マンガのページ、本の写真、日本語テキストが含まれるものなら何でも。アプリは1つのアルバムにつき最大500枚の画像をサポートし、ファイル名順にソートされます。",
        color: "from-violet-500 to-purple-500",
        tip: "ファイル名に先頭ゼロを付けて（page_001.jpg、page_002.jpgなど）正しくソートされるようにしてください。",
      },
      {
        number: "03",
        title: "ページでOCRを実行する",
        description:
          "「処理」をクリックして、バッチですべてのページでOCRを実行します。デフォルトでは、PaddleOCRが完全にブラウザ内で実行され、画像はどこにも送信されません。特定の領域については、任意のページで「エリア選択」ツールを使用してください。",
        color: "from-orange-500 to-red-500",
        tip: "初回実行時にONNXモデルファイルをダウンロードします（約30〜60秒）。その後、OCRは即座に動作し、オフラインで機能します。",
      },
      {
        number: "04",
        title: "単語をタップして検索する",
        description:
          "アルバムビューアーで処理済みのページを開きます。OCR結果の任意の単語をタップまたはクリックすると、ロード済みの辞書で即座に検索できます。読み、意味、使用例が表示されます。",
        color: "from-emerald-500 to-green-500",
        tip: "トークナイザー（Kuromoji）がテキストを自動的に個々の単語に分解するため、文全体ではなく単一の単語をタップします。",
      },
      {
        number: "05",
        title: "単語をお気に入りに保存する",
        description:
          "覚えておきたい単語を見つけましたか？スターアイコンを押してお気に入りページに保存します。保存した各単語に個人的なメモを追加したり、後でコレクションを検索したりできます。",
        color: "from-yellow-500 to-orange-500",
        tip: "お気に入りはlocalStorageに保存されます——セッション間で保持されますが、デバイス上に留まります。",
      },
      {
        number: "06",
        title: "ローカルAIモデルで翻訳する",
        description:
          "翻訳ツールに移動し、「モデルを有効化」をクリックします。アプリはopus-mt翻訳モデル（75〜150MB、初回ロード後にキャッシュ）をダウンロードし、WebAssembly経由でローカルで実行します。",
        color: "from-pink-500 to-rose-500",
        tip: "翻訳モデルは初回ダウンロード後にオフラインで動作します。iOSでは、メモリが制限されたデバイスでの使用を避けてください。",
      },
    ],
    extraFeaturesTitle: "その他の機能",
    extras: [
      {
        title: "iPhoneのホーム画面に追加",
        description:
          "Safariで、共有→ホーム画面に追加をタップします。アプリはブラウザUIなしでフルスクリーンで開き、ネイティブアプリのように動作します。",
      },
      {
        title: "Ankiデッキをインポート",
        description:
          "Ankiインポートに移動し、.apkgファイルをアップロードします。アプリはsql.js（SQLite/WASM）を使用してブラウザ内で完全に解析します——Anki Desktopは不要です。",
      },
      {
        title: "簡易リーダーでクイックテキスト",
        description:
          "任意の日本語文を簡易リーダーに貼り付けると、辞書検索で単語ごとの即座の分析が行われます——画像は不要です。",
      },
      {
        title: "サーバーサイドOCR（上級）",
        description:
          "複雑なレイアウトでより良いOCR品質を得るには、Dockerバックエンド（PaddleOCRまたはYomiToku）を実行します。設定でクライアントサイドOCRを無効にし、APIをhttp://localhost:8000に向けてください。",
      },
    ],
    ctaText: "日本語テキストの抽出を始める準備はできましたか？",
    ctaButton: "OCRツールへ",
  },
};
