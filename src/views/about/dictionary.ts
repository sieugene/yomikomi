export const dictionary = {
  en: {
    badge: "Open Source · Privacy First · Mobile Ready",
    title: "The story behind",
    titleHighlight: "Yomikomi",
    subtitle:
      "How a Japanese learner's frustration turned into a browser-first reading toolkit.",
    howToUse: "How to Use",
    viewSource: "View Source",

    sections: [
      {
        tag: "The Problem",
        icon: "📖",
        title: "Reading Japanese shouldn't feel like detective work",
        paragraphs: [
          "Like many Japanese learners, I relied on Yomitan on desktop — it's fantastic. But the moment I picked up my phone to read manga or a novel, everything fell apart. My workflow became: spot an unknown word → screenshot → Google Translate → copy the Japanese text → search in 'imiwa?' It's exhausting and completely kills reading immersion.",
          "OCR tools like Mokuro existed, but required setting up a local environment and were tethered to a computer. I wanted something I could open in Safari on my phone and just... read.",
        ],
      },
      {
        tag: "The Origins",
        icon: "🌱",
        title: "It started with anime subtitles",
        paragraphs: [
          "The seed was planted with an earlier project: subtitles-hook. The idea was simple — load a local video, generate subtitles via Turboscribe, and hover over words while Yomitan does the heavy lifting. It worked beautifully on desktop.",
          "But watching anime on my phone with no Yomitan available made me think: what if the dictionary lived in the browser itself? That question led me down a rabbit hole of WASM, ONNX, and client-side AI models.",
        ],
        link: {
          label: "subtitles-hook on GitHub",
          href: "https://github.com/sieugene/subtitles-hook",
        },
      },
      {
        tag: "Earlier Experiments",
        icon: "🔬",
        title: "jp-reader: the first attempt",
        paragraphs: [
          "Before Yomikomi, I built jp-reader — a companion app for reading Japanese text with dictionary lookups baked in. It was convenient, but still required a computer and a running server. Every solution I built kept pulling me back to the same constraint.",
        ],
        link: {
          label: "jp-reader on GitHub",
          href: "https://github.com/sieugene/jp-reader",
        },
      },
      {
        tag: "The Pivot",
        icon: "⚡",
        title: "Anki decks → Reading companion",
        paragraphs: [
          "Yomikomi actually started as an Anki deck tool. I found ways to parse .apkg files as SQLite databases in Node.js, which worked great — but only on the backend. Then I discovered sql.js, a full SQLite compiled to WebAssembly. Suddenly, I could parse Anki decks entirely in the browser, no server needed.",
          "That discovery changed everything. If I could run SQLite in the browser, what else could I run? The answer was PaddleOCR via ONNX Runtime Web — Japanese text recognition, client-side, no cloud, no API keys.",
        ],
      },
      {
        tag: "Backend vs. Browser",
        icon: "🖥️",
        title: "The server vs. client tradeoff",
        paragraphs: [
          "I first tried running OCR models on a backend server — a Docker container with PaddleOCR or YomiToku. Quality was excellent, but self-hosting requires infrastructure, a VPS, and ongoing maintenance. The app still supports this mode (see the server/ directory in the repo), but I personally stopped using it.",
          "The browser-native approach wins on accessibility: install nothing, pay for nothing, your images never leave your device. Yes, model quality is slightly lower than server-side inference, and yes, large transformer models can crash iOS Safari — these are known limitations I'm actively working on.",
        ],
      },
      {
        tag: "Today",
        icon: "🚀",
        title: "Where Yomikomi stands now",
        paragraphs: [
          "If you're a Japanese learner who wants to read books, manga, or any Japanese text on your phone — without installing extensions, without running servers, without sending your content to Google — Yomikomi might be exactly what you need.",
          "Add it to your iPhone Home Screen via Safari → Share → Add to Home Screen, and it runs like a native app. Dictionary, OCR, tokenizer, translator — all local, all private.",
        ],
      },
    ],

    techStack: {
      title: "Built with",
      items: [
        { label: "Next.js 16", desc: "App Router + TypeScript" },
        { label: "sql.js + WASM", desc: "SQLite in the browser" },
        { label: "ONNX Runtime Web", desc: "PaddleOCR client-side" },
        { label: "Transformers.js", desc: "Local translation models" },
        { label: "Kuromoji.js", desc: "Japanese tokenization" },
        { label: "IndexedDB", desc: "Local storage for albums" },
      ],
    },

    cta: {
      title: "Ready to try it?",
      subtitle: "No setup. No account. Open the app and start reading.",
      primary: "Open the App",
      secondary: "How to Use",
    },
  },

  ja: {
    badge: "オープンソース · プライバシー重視 · モバイル対応",
    title: "誕生の背景",
    titleHighlight: "Yomikomi",
    subtitle:
      "日本語学習者の不満が、ブラウザで完結する読書ツールに変わるまでの物語。",
    howToUse: "使い方",
    viewSource: "ソースを見る",

    sections: [
      {
        tag: "問題",
        icon: "📖",
        title: "日本語読書は謎解きであるべきではない",
        paragraphs: [
          "多くの日本語学習者と同様、デスクトップではYomitanを愛用していました。でもスマホでマンガや小説を読もうとすると、すべてが崩壊します。知らない単語を見つける → スクリーンショット → Google翻訳 → 日本語テキストをコピー → 'imiwa?'で検索。これは本当に疲れるし、読書の没入感を完全に壊してしまいます。",
          "MokuroなどのOCRツールは存在していましたが、ローカル環境のセットアップが必要でパソコンに縛られていました。スマホのSafariで開いてただ読める何かが欲しかったのです。",
        ],
      },
      {
        tag: "起源",
        icon: "🌱",
        title: "アニメの字幕から始まった",
        paragraphs: [
          "きっかけは以前作ったプロジェクト「subtitles-hook」でした。シンプルなアイデア——ローカル動画を読み込み、Turboscribeで字幕を生成し、Yomitanで単語にホバーする。デスクトップでは完璧に動きました。",
          "でもスマホでアニメを見るときYomitanが使えないことで気づきました。辞書そのものをブラウザに内蔵できないだろうか？その問いがWASM、ONNX、クライアントサイドAIモデルの世界への扉を開きました。",
        ],
        link: {
          label: "GitHubでsubtitles-hookを見る",
          href: "https://github.com/sieugene/subtitles-hook",
        },
      },
      {
        tag: "初期の試み",
        icon: "🔬",
        title: "jp-reader：最初のアプローチ",
        paragraphs: [
          "Yomikomiの前に、辞書検索を内蔵した日本語テキスト読書アプリ「jp-reader」を作りました。便利でしたが、やはりパソコンとサーバーが必要でした。どの解決策を作っても、同じ制約に引き戻されていました。",
        ],
        link: {
          label: "GitHubでjp-readerを見る",
          href: "https://github.com/sieugene/jp-reader",
        },
      },
      {
        tag: "転換点",
        icon: "⚡",
        title: "Ankiデッキ → 読書コンパニオン",
        paragraphs: [
          "実はYomikomiはもともとAnkiデッキツールとして始まりました。Node.jsで.apkgファイルをSQLiteデータベースとして解析する方法を見つけましたが、バックエンドのみで動作しました。そこでsql.js——WebAssemblyにコンパイルされた完全なSQLite——を発見。突然、サーバー不要でブラウザだけでAnkiデッキを解析できるようになりました。",
          "この発見がすべてを変えました。SQLiteをブラウザで動かせるなら、他に何が動かせるか？答えはONNX Runtime WebによるPaddleOCR——日本語テキスト認識がクライアントサイドで、クラウドなし、APIキーなしで実現しました。",
        ],
      },
      {
        tag: "バックエンド vs ブラウザ",
        icon: "🖥️",
        title: "サーバーとクライアントのトレードオフ",
        paragraphs: [
          "最初はバックエンドサーバーでOCRモデルを動かすことを試みました——PaddleOCRやYomiTokuを使ったDockerコンテナです。品質は優れていましたが、自己ホスティングにはインフラ、VPS、継続的なメンテナンスが必要です。アプリはまだこのモードをサポートしていますが（リポジトリのserver/ディレクトリを参照）、私個人はもう使っていません。",
          "ブラウザネイティブのアプローチはアクセシビリティで勝ります。インストール不要、費用不要、画像はデバイスから出ません。モデル品質はサーバーサイドより若干劣り、大きなTransformerモデルがiOS Safariをクラッシュさせることもありますが——これらは既知の制限として取り組んでいます。",
        ],
      },
      {
        tag: "現在",
        icon: "🚀",
        title: "Yomikomiの今",
        paragraphs: [
          "拡張機能のインストールなし、サーバーの起動なし、コンテンツをGoogleに送信なし——スマホで本、マンガ、日本語テキストを読みたい日本語学習者なら、Yomikomiが求めていたものかもしれません。",
          "Safari → 共有 → ホーム画面に追加でiPhoneのホーム画面に追加すれば、ネイティブアプリのように動きます。辞書、OCR、トークナイザー、翻訳——すべてローカル、すべてプライベート。",
        ],
      },
    ],

    techStack: {
      title: "使用技術",
      items: [
        { label: "Next.js 16", desc: "App Router + TypeScript" },
        { label: "sql.js + WASM", desc: "ブラウザ内SQLite" },
        { label: "ONNX Runtime Web", desc: "クライアントサイドPaddleOCR" },
        { label: "Transformers.js", desc: "ローカル翻訳モデル" },
        { label: "Kuromoji.js", desc: "日本語形態素解析" },
        { label: "IndexedDB", desc: "アルバムのローカルストレージ" },
      ],
    },

    cta: {
      title: "試してみますか？",
      subtitle:
        "セットアップ不要。アカウント不要。アプリを開いて読み始めましょう。",
      primary: "アプリを開く",
      secondary: "使い方",
    },
  },
};