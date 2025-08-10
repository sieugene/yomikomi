import { DictionaryEntry, SearchOptions, SearchResult } from "../types";
import { SEARCH_LIMITS } from './constants';

export class SearchTermGenerator {
  /**
   * Генерирует поисковые термины с подстроками для японского текста
   * Например: 日本語 -> [日本語, 日本, 日, 語]
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

    // Генерируем подстроки слева направо
    for (let i = word.length - 1; i >= minLength; i--) {
      terms.add(word.substring(0, i));
      if (terms.size >= maxSubstrings) break;
    }

    // Генерируем подстроки справа налево (для некоторых случаев)
    if (includeReversed && terms.size < maxSubstrings) {
      for (let i = 1; i <= word.length - minLength; i++) {
        terms.add(word.substring(i));
        if (terms.size >= maxSubstrings) break;
      }
    }

    return Array.from(terms);
  }

  /**
   * Генерирует поисковые термины из токенов
   */
  static generateFromTokens(
    tokens: any[],
    searchOptions: SearchOptions
  ): string[] {
    const terms = new Set<string>();
    const limit = searchOptions.deepMode
      ? SEARCH_LIMITS.DEEP_MODE.MAX_TOKENS
      : SEARCH_LIMITS.FAST_MODE.MAX_TOKENS;

    for (let i = 0; i < Math.min(tokens.length, limit); i++) {
      const token = tokens[i];
      const { surface_form, basic_form, reading } = token;

      // Основные формы
      if (basic_form) terms.add(basic_form);
      if (surface_form && surface_form !== basic_form) terms.add(surface_form);
      if (reading && reading !== basic_form && reading !== surface_form) {
        terms.add(reading);
      }

      // Подстроки для длинных слов
      if (searchOptions.includeSubstrings) {
        const wordToAnalyze = surface_form || basic_form;
        if (wordToAnalyze && wordToAnalyze.length > 1) {
          const maxSubstrings = searchOptions.deepMode
            ? SEARCH_LIMITS.DEEP_MODE.MAX_SUBSTRINGS
            : SEARCH_LIMITS.FAST_MODE.MAX_SUBSTRINGS;

          const substrings = this.generateSearchTerms(wordToAnalyze, {
            maxSubstrings,
            minLength: 1,
            includeReversed: searchOptions.deepMode,
          });

          substrings.forEach((term) => terms.add(term));
        }
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

    // Базовый скор по типу соответствия
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

    // Бонус за точное совпадение
    if (result.word === searchTerm) score += 50;

    // Длина слова (более длинные слова специфичнее)
    score += Math.min(result.word.length * 3, 30);

    // Количество значений (но не более 15 баллов)
    score += Math.min(result.meanings.length * 2, 15);

    // Штраф за односимвольные слова
    if (result.word.length === 1) score -= 15;

    // Бонус за совпадение чтения
    if (result.reading === searchTerm) score += 20;

    return score;
  }
}
