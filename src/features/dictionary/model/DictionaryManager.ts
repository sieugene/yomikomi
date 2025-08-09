import { BaseStoreManager } from "@/features/storage/model/BaseStoreManager";
import type { SqlJsStatic } from "sql.js";
import {
  DictionaryMetadata,
  DictionaryParserConfig,
  DictionaryTemplate,
  ParserTestResult,
} from "../types/dictionary.types";

interface StoredDictionary {
  key: string;
  name: string;
  type: string;
  content: Blob;
  metadata: DictionaryMetadata;
}

export class DictionaryManager extends BaseStoreManager<StoredDictionary> {
  private sqlClient: SqlJsStatic | null = null;
  private templates: Map<string, DictionaryTemplate> = new Map();

  constructor(sqlClient?: SqlJsStatic) {
    super("DictionaryManagerDB", "dictionaries");
    this.sqlClient = sqlClient!;
    this.loadDefaultTemplates();
  }

  setSqlClient(client: SqlJsStatic) {
    this.sqlClient = client;
  }

  private loadDefaultTemplates() {
    const defaultTemplates: DictionaryTemplate[] = [
      {
        id: "jmdict_en",
        name: "JMdict English",
        language: "en",
        description: "Standard JMdict English dictionary format",
        config: {
          name: "JMdict English Parser",
          version: "1.0.0",
          sqlQuery: `
            WITH RECURSIVE token_parts AS (
              SELECT ? as token
              UNION ALL
              SELECT substr(token, 1, length(token)-1)
              FROM token_parts 
              WHERE length(token) > 1
            )
            SELECT DISTINCT t.* FROM terms t
            JOIN token_parts tp ON t."0" = tp.token
            ORDER BY length(t."0") DESC
          `,
          columnMapping: {
            word: 0,
            reading: 1,
            type: 2,
            meanings: 5,
          },
          meaningParser: {
            type: "json",
            customFunction: `
              function parseMeanings(rawContent) {
                try {
                  if (Array.isArray(rawContent)) return rawContent;
                  const structured = JSON.parse(rawContent);
                  const meanings = [];
                  for (const block of structured) {
                    if (block.type === 'structured-content') {
                      const roots = Array.isArray(block.content) ? block.content : [block.content];
                      for (const root of roots) {
                        meanings.push(...extractLiMeanings(root));
                      }
                    }
                  }
                  return meanings;
                } catch (e) {
                  return [];
                }
              }
              
              function extractLiMeanings(node) {
                const result = [];
                if (node.tag === 'ul' && node.data?.content === 'glossary') {
                  const items = Array.isArray(node.content) ? node.content : [node.content];
                  for (const li of items) {
                    if (typeof li === 'object' && li.tag === 'li' && typeof li.content === 'string') {
                      result.push(li.content);
                    }
                  }
                }
                const children = Array.isArray(node.content) ? node.content : [node.content];
                for (const child of children) {
                  if (typeof child === 'object' && child !== null) {
                    result.push(...extractLiMeanings(child));
                  }
                }
                return result;
              }
              
              return parseMeanings(rawContent);
            `,
          },
          searchStrategy: {
            type: "partial",
            includeSubstrings: true,
          },
        },
      },
      {
        id: "jmdict_ru",
        name: "JMdict Russian",
        language: "ru",
        description: "Standard JMdict Russian dictionary format",
        config: {
          name: "JMdict Russian Parser",
          version: "1.0.0",
          sqlQuery: `
            WITH RECURSIVE token_parts AS (
              SELECT ? as token
              UNION ALL
              SELECT substr(token, 1, length(token)-1)
              FROM token_parts 
              WHERE length(token) > 1
            )
            SELECT DISTINCT t.* FROM terms t
            JOIN token_parts tp ON t."0" = tp.token
            ORDER BY length(t."0") DESC
          `,
          columnMapping: {
            word: 0,
            reading: 1,
            type: 2,
            meanings: 5,
          },
          meaningParser: {
            type: "array",
          },
          searchStrategy: {
            type: "partial",
            includeSubstrings: true,
          },
        },
      },
    ];

    defaultTemplates.forEach((template) => {
      this.templates.set(template.id, template);
    });
  }

  getTemplates(): DictionaryTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplate(id: string): DictionaryTemplate | undefined {
    return this.templates.get(id);
  }

  async addCustomTemplate(template: DictionaryTemplate): Promise<void> {
    this.templates.set(template.id, template);
  }

  async testParser(
    file: File,
    config: DictionaryParserConfig,
    testTokens: string[] = ["test", "テスト"]
  ): Promise<ParserTestResult> {
    if (!this.sqlClient) {
      return {
        success: false,
        sampleResults: [],
        errors: ["SQL client not initialized"],
        performance: { queryTime: 0, parseTime: 0 },
      };
    }

    const startTime = performance.now();

    try {
      const arrayBuffer = await file.arrayBuffer();
      const db = new this.sqlClient.Database(new Uint8Array(arrayBuffer));

      const queryStartTime = performance.now();
      const results = [];

      for (const token of testTokens) {
        try {
          const stmt = db.prepare(config.sqlQuery);
          stmt.bind([token]);

          while (stmt.step()) {
            const row = stmt.getAsObject();
            const values = Object.values(row);

            const parseStartTime = performance.now();
            const parsed = this.parseEntry(values, config);
            const parseTime = performance.now() - parseStartTime;

            if (parsed) {
              results.push(parsed);
            }

            if (results.length >= 5) break; // Ограничиваем для теста
          }
          stmt.free();
        } catch (error) {
          console.warn(`Error testing token ${token}:`, error);
        }
      }

      const queryTime = performance.now() - queryStartTime;
      const totalTime = performance.now() - startTime;

      db.close();

      return {
        success: results.length > 0,
        sampleResults: results.slice(0, 3),
        errors:
          results.length === 0 ? ["No results found for test tokens"] : [],
        performance: {
          queryTime,
          parseTime: totalTime - queryTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        sampleResults: [],
        errors: [error instanceof Error ? error.message : "Unknown error"],
        performance: { queryTime: 0, parseTime: 0 },
      };
    }
  }

  private parseEntry(values: any[], config: DictionaryParserConfig): any {
    try {
      const word = values[config.columnMapping.word as number] || "";
      const reading = values[config.columnMapping.reading as number] || "";
      const type = values[config.columnMapping.type as number] || "";
      const rawMeanings = values[config.columnMapping.meanings as number];

      let meanings: string[] = [];

      switch (config.meaningParser.type) {
        case "array":
          meanings = Array.isArray(rawMeanings) ? rawMeanings : [];
          break;
        case "string":
          meanings = typeof rawMeanings === "string" ? [rawMeanings] : [];
          break;
        case "json":
          try {
            meanings = Array.isArray(rawMeanings)
              ? rawMeanings
              : JSON.parse(rawMeanings);
          } catch {
            meanings = [];
          }
          break;
        case "custom":
          if (config.meaningParser.customFunction) {
            try {
              const fn = new Function(
                "rawContent",
                config.meaningParser.customFunction
              );
              meanings = fn(rawMeanings) || [];
            } catch (error) {
              console.warn("Custom parser function error:", error);
              meanings = [];
            }
          }
          break;
      }

      return {
        word: String(word),
        reading: String(reading),
        type: String(type),
        meanings: Array.isArray(meanings) ? meanings : [],
      };
    } catch (error) {
      console.warn("Parse entry error:", error);
      return null;
    }
  }

  async addDictionary(
    file: File,
    templateId?: string,
    customConfig?: DictionaryParserConfig
  ): Promise<string> {
    const config = customConfig || this.getTemplate(templateId!)?.config;
    if (!config) {
      throw new Error("No parser configuration provided");
    }

    // Тестируем парсер перед сохранением
    const testResult = await this.testParser(file, config);
    if (!testResult.success) {
      throw new Error(`Parser test failed: ${testResult.errors.join(", ")}`);
    }

    const metadata: DictionaryMetadata = {
      id: crypto.randomUUID(),
      name: file.name,
      language: templateId
        ? this.getTemplate(templateId)?.language || "unknown"
        : "custom",
      size: file.size,
      createdAt: new Date(),
      updatedAt: new Date(),
      parserTemplate: templateId || "custom",
      customParser: customConfig,
      status: "active",
      lastTestResult: testResult,
    };

    const stored: StoredDictionary = {
      key: metadata.id,
      name: file.name,
      type: file.type,
      content: file,
      metadata,
    };

    await this.save(stored);
    return metadata.id;
  }

  async getDictionaries(): Promise<DictionaryMetadata[]> {
    const dictionaries = await this.list();
    return dictionaries.map((d) => d.metadata);
  }

  async getDictionary(id: string): Promise<StoredDictionary | null> {
    return this.get(id);
  }

  async updateDictionaryStatus(
    id: string,
    status: DictionaryMetadata["status"]
  ): Promise<void> {
    const dict = await this.get(id);
    if (dict) {
      dict.metadata.status = status;
      dict.metadata.updatedAt = new Date();
      await this.save(dict);
    }
  }

  async deleteDictionary(id: string): Promise<void> {
    await this.delete(id);
  }

  getTotalSize(): Promise<number> {
    return this.getDictionaries().then((dicts) =>
      dicts.reduce((total, dict) => total + dict.size, 0)
    );
  }

  protected asFile(data: StoredDictionary): File | null {
    try {
      return new File([data.content], data.name, { type: data.type });
    } catch {
      return null;
    }
  }
}
