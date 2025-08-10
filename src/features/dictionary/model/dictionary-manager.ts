import { BaseStoreManager } from "@/features/storage/model/BaseStoreManager";
import type { SqlJsStatic } from "sql.js";
import {
  DictionaryEntry,
  DictionaryMetadata,
  DictionaryParserConfig,
  DictionaryTemplate,
  ParserTestResult,
} from "../types";
import { DICTIONARY_TEMPLATES } from "../lib/constants";
import { ConfigValidator } from "../lib/validation";

export interface StoredDictionary {
  key: string;
  name: string;
  type: string;
  content: Blob;
  metadata: DictionaryMetadata;
}

export class DictionaryManager extends BaseStoreManager<StoredDictionary> {
  private sqlClient: SqlJsStatic;
  private CUSTOM_TEMPLATES_STORAGE_KEY = "templates";

  constructor(sqlClient: SqlJsStatic) {
    super("DictionaryManagerDB", "dictionaries");
    this.sqlClient = sqlClient;
  }

  getTemplates(): DictionaryTemplate[] {
    return [
      ...Object.values(DICTIONARY_TEMPLATES),
      ...Object.values(this.getTemplatesFromStorage()),
    ];
  }

  getTemplate(id: string): DictionaryTemplate | undefined {
    return DICTIONARY_TEMPLATES[id] || this.getTemplatesFromStorage()[id];
  }

  // TODO refactor me!
  private getTemplatesFromStorage() {
    const templates: Record<string, DictionaryTemplate> = JSON.parse(
      localStorage.getItem(this.CUSTOM_TEMPLATES_STORAGE_KEY) || "{}"
    );
    return templates;
  }
  private setTemplateInStorage(template: DictionaryTemplate) {
    const nextCustom: Record<string, DictionaryTemplate> = {
      ...this.getTemplatesFromStorage(),
      [template.id]: template,
    };
    localStorage.setItem(
      this.CUSTOM_TEMPLATES_STORAGE_KEY,
      JSON.stringify(nextCustom)
    );
  }

  // TODO refactor me!
  async addCustomTemplate(template: DictionaryTemplate): Promise<void> {
    // TODO should ignore?
    // const errors = ConfigValidator.validateTemplate(template);
    // if (errors.length > 0) {
    //   throw new Error(`Template validation failed: ${errors.join(", ")}`);
    // }
    this.setTemplateInStorage(template);
    // TODO Don't really need, useswr make refetch all
    // this.customTemplates.set(template.id, template);
  }

  async testParser(
    file: File,
    config: DictionaryParserConfig,
    testTokens: string[] = ["test", "テスト", "試験"]
  ): Promise<ParserTestResult> {
    const errors = ConfigValidator.validateParserConfig(config);
    if (errors.length > 0) {
      return {
        success: false,
        sampleResults: [],
        errors,
        performance: { queryTime: 0, parseTime: 0 },
      };
    }

    const startTime = performance.now();

    try {
      const arrayBuffer = await file.arrayBuffer();
      const db = new this.sqlClient.Database(new Uint8Array(arrayBuffer));

      const queryStartTime = performance.now();
      const results: DictionaryEntry[] = [];

      for (const token of testTokens) {
        try {
          const stmt = db.prepare(config.sqlQuery);

          const params = this.buildTestQueryParams(token, config);
          stmt.bind(params);

          while (stmt.step() && results.length < 10) {
            const row = stmt.getAsObject();
            const values = Object.values(row);

            const parsed = this.parseEntry(values, config);

            if (parsed) {
              results.push(parsed);
            }
          }

          stmt.free();
        } catch (error) {
          console.warn(`Error testing token ${token}:`, error);
        }
      }

      const queryTime = performance.now() - queryStartTime;
      const totalTime = performance.now() - startTime;

      db.close();

      const errors = [];
      if (results.length === 0) {
        errors.push("No results found for test tokens");
      }
      if (results.length > 1 && results[0].meanings.length === 0) {
        errors.push(
          "Results were found but contain no meanings. Please check the parser type or parser function."
        );
      }

      return {
        success: results.length > 0,
        sampleResults: results.slice(0, 5),
        errors,
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

  private buildTestQueryParams(
    token: string,
    config: DictionaryParserConfig
  ): any[] {
    const placeholderCount = (config.sqlQuery.match(/\?/g) || []).length;

    if (placeholderCount === 1) {
      return [token];
    } else if (placeholderCount === 6) {
      return [token, token, token, token, token, 10];
    } else {
      return Array(placeholderCount).fill(token);
    }
  }

  private parseEntry(
    values: any[],
    config: DictionaryParserConfig
  ): DictionaryEntry | null {
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
        meanings: Array.isArray(meanings) ? meanings.filter(Boolean) : [],
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

  async getTotalSize(): Promise<number> {
    const dicts = await this.getDictionaries();
    return dicts.reduce((total, dict) => total + dict.size, 0);
  }

  protected asFile(data: StoredDictionary): File | null {
    try {
      return new File([data.content], data.name, { type: data.type });
    } catch {
      return null;
    }
  }
}
