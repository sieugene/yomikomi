import { useState, useEffect } from "react";
import {
  DictionaryParserConfig,
  ParserTestResult,
} from "@features/dictionary/types";
import { ConfigValidator } from "@features/dictionary/lib/validation";
import { DEFAULT_CONFIG } from "../lib/constants";

export function useCustomTemplateConfig(
  initialConfig?: DictionaryParserConfig
) {
  const [config, setConfig] = useState<DictionaryParserConfig>(
    initialConfig || DEFAULT_CONFIG
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<ParserTestResult | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setValidationErrors(ConfigValidator.validateParserConfig(config));
  }, [config]);

  const updateField = <K extends keyof DictionaryParserConfig>(
    field: K,
    value: DictionaryParserConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setTestResult(null);
  };

  return {
    config,
    updateField,
    validationErrors,
    testResult,
    setTestResult,
    testing,
    setTesting,
  };
}
