import { DictionaryParserConfig, DictionaryTemplate } from '../types';

export class ConfigValidator {
  static validateParserConfig(config: DictionaryParserConfig): string[] {
    const errors: string[] = [];

    if (!config.name?.trim()) {
      errors.push("Parser name is required");
    }

    if (!config.sqlQuery?.trim()) {
      errors.push("SQL query is required");
    }

    if (!config.columnMapping) {
      errors.push("Column mapping is required");
    } else {
      const required = ["word", "reading", "type", "meanings"];
      for (const field of required) {
        if (!(field in config.columnMapping)) {
          errors.push(`Column mapping missing: ${field}`);
        }
      }
    }

    if (
      config.meaningParser?.type === "custom" &&
      !config.meaningParser.customFunction?.trim()
    ) {
      errors.push("Custom parser function is required when type is 'custom'");
    }

    // Проверка SQL запроса на базовую безопасность
    if (config.sqlQuery && this.containsUnsafeSQL(config.sqlQuery)) {
      errors.push("SQL query contains potentially unsafe operations");
    }

    return errors;
  }

  private static containsUnsafeSQL(sql: string): boolean {
    const unsafe = /\b(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER|EXEC|EXECUTE)\b/i;
    return unsafe.test(sql);
  }

  static validateTemplate(template: DictionaryTemplate): string[] {
    const errors: string[] = [];

    if (!template.id?.trim()) errors.push("Template ID is required");
    if (!template.name?.trim()) errors.push("Template name is required");
    if (!template.language?.trim())
      errors.push("Template language is required");
    if (!template.description?.trim())
      errors.push("Template description is required");

    errors.push(...this.validateParserConfig(template.config));

    return errors;
  }
}
