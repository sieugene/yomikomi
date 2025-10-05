export class SearchTermGenerator {
  /**
   * Generate many useful tokens/variants from input like:
   * 最終盤 -> ["最終盤","最終","終盤","最","終","盤"]
   * For hiragana/katakana it also returns progressive substrings.
   */
  static generateVariants(
    word: string,
    opts: { minLen?: number; maxVariants?: number } = {}
  ) {
    const minLen = opts.minLen ?? 1;
    const maxVariants = opts.maxVariants ?? 100;

    const normalized = String(word || "")
      .normalize("NFKC")
      .trim();
    const set = new Set<string>();

    if (!normalized) return [];

    set.add(normalized);

    // add all contiguous substrings (useful for splitting 最終盤 -> 最終 / 終盤)
    for (let i = 0; i < normalized.length; i++) {
      for (let j = i + 1; j <= normalized.length; j++) {
        const sub = normalized.slice(i, j);
        if (sub.length >= minLen) set.add(sub);
        if (set.size >= maxVariants) break;
      }
      if (set.size >= maxVariants) break;
    }

    // add progressive prefixes and suffixes
    for (let i = 1; i <= normalized.length; i++) {
      const pref = normalized.slice(0, i);
      const suff = normalized.slice(normalized.length - i);
      if (pref.length >= minLen) set.add(pref);
      if (suff.length >= minLen) set.add(suff);
      if (set.size >= maxVariants) break;
    }

    // if Japanese, add single-kanji tokens for kanji chars
    for (const ch of normalized) {
      const code = ch.charCodeAt(0);
      const isKanji =
        (code >= 0x4e00 && code <= 0x9fff) ||
        (code >= 0x3400 && code <= 0x4dbf) ||
        (code >= 0xf900 && code <= 0xfaff);
      if (isKanji) set.add(ch);
      if (set.size >= maxVariants) break;
    }

    // Convert to array and sort: prefer longer variants first (more specific)
    return Array.from(set).sort(
      (a, b) => b.length - a.length || a.localeCompare(b)
    );
  }
}
