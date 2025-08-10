export interface DictionaryEntry {
  word: string;
  reading: string;
  type: string;
  meanings: string[];
}

export interface SearchResult extends DictionaryEntry {
  source: string;
  relevanceScore: number;
  matchType: 'exact' | 'partial' | 'substring';
}

export interface DictionaryMetadata {
  id: string;
  name: string;
  language: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  parserTemplate: string;
  customParser?: DictionaryParserConfig;
  status: 'active' | 'inactive' | 'error';
  lastTestResult?: ParserTestResult;
}

export interface DictionaryParserConfig {
  name: string;
  version: string;
  sqlQuery: string;
  columnMapping: {
    word: string | number;
    reading: string | number;
    type: string | number;
    meanings: string | number;
  };
  meaningParser: {
    type: 'json' | 'array' | 'string' | 'custom';
    customFunction?: string;
  };
  searchStrategy: {
    type: 'exact' | 'partial' | 'ngram';
    ngramSize?: number;
    includeSubstrings?: boolean;
  };
}

export interface ParserTestResult {
  success: boolean;
  sampleResults: DictionaryEntry[];
  errors: string[];
  performance: {
    queryTime: number;
    parseTime: number;
  };
}

export interface DictionaryTemplate {
  id: string;
  name: string;
  language: string;
  description: string;
  config: DictionaryParserConfig;
  downloadUrl?: string;
  example?: string;
}

export interface SearchOptions {
  deepMode: boolean;
  maxResults: number;
  includePartialMatches: boolean;
  includeSubstrings: boolean;
}