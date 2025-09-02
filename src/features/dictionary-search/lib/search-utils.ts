import { SearchResult } from "@/features/dictionary-search/types";
import { DictionaryEntry } from "@/features/dictionary/types";

export class SearchTermGenerator {
  /**
   * Generates search terms with substrings for Japanese text
   * Example: 日本語 -> [日本語, 日本, 日, 語]
   */
  static generateSearchTerms(
    word: string,
    options: {
      maxSubstrings?: number;
      includeReversed?: boolean;
      minLength?: number;
    } = {}
  ): string[] {
    const {
      maxSubstrings = 5,
      includeReversed = false,
      minLength = 1,
    } = options;

    const terms = new Set<string>();
    terms.add(word);

    for (let i = word.length - 1; i >= minLength; i--) {
      terms.add(word.substring(0, i));
      if (terms.size >= maxSubstrings) break;
    }

    if (includeReversed && terms.size < maxSubstrings) {
      for (let i = 1; i <= word.length - minLength; i++) {
        terms.add(word.substring(i));
        if (terms.size >= maxSubstrings) break;
      }
    }

    return Array.from(terms);
  }
}

export class RelevanceCalculator {
  static calculateRelevance(
    result: DictionaryEntry,
    searchTerm: string,
    matchType: SearchResult["matchType"]
  ): number {
    let score = 0;

    switch (matchType) {
      case "exact":
        score += 100;
        break;
      case "partial":
        score += 50;
        break;
      case "substring":
        score += 25;
        break;
    }

    // Bonus for exact match
    if (result.word === searchTerm) score += 50;

    // Word length (longer words are more specific)
    score += Math.min(result.word.length * 3, 30);

    // Number of values (but not more than 15 points)
    score += Math.min(result.meanings.length * 2, 15);

    // Penalty for single-character words
    if (result.word.length === 1) score -= 15;

    // Bonus for reading match
    if (result.reading === searchTerm) score += 20;

    return score;
  }
}
