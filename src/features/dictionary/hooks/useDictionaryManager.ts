import { useEffect, useRef, useState } from "react";
import { useSqlJs } from "@/features/AnkiParser/context/SqlJsProvider";
import { DictionaryManager } from "../model/DictionaryManager";
import {
  DictionaryMetadata,
  DictionaryTemplate,
  DictionaryParserConfig,
  ParserTestResult,
} from "../types/dictionary.types";

export const useDictionaryManager = () => {
  const { sqlClient } = useSqlJs();
  const [dictionaries, setDictionaries] = useState<DictionaryMetadata[]>([]);
  const [templates, setTemplates] = useState<DictionaryTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalSize, setTotalSize] = useState(0);

  const manager = useRef<DictionaryManager | null>(null);

  useEffect(() => {
    if (sqlClient && !manager.current) {
      manager.current = new DictionaryManager(sqlClient);
      loadData();
    }
  }, [sqlClient]);

  const loadData = async () => {
    if (!manager.current) return;

    setLoading(true);
    try {
      const [dicts, totalSizeBytes] = await Promise.all([
        manager.current.getDictionaries(),
        manager.current.getTotalSize(),
      ]);

      setDictionaries(dicts);
      setTotalSize(totalSizeBytes);
      setTemplates(manager.current.getTemplates());
    } catch (error) {
      console.error("Failed to load dictionary data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addDictionary = async (
    file: File,
    templateId?: string,
    customConfig?: DictionaryParserConfig
  ): Promise<string> => {
    if (!manager.current) throw new Error("Manager not initialized");

    setLoading(true);
    try {
      const id = await manager.current.addDictionary(
        file,
        templateId,
        customConfig
      );
      await loadData();
      return id;
    } finally {
      setLoading(false);
    }
  };

  const testParser = async (
    file: File,
    config: DictionaryParserConfig,
    testTokens?: string[]
  ): Promise<ParserTestResult> => {
    if (!manager.current) throw new Error("Manager not initialized");
    return manager.current.testParser(file, config, testTokens);
  };

  const deleteDictionary = async (id: string): Promise<void> => {
    if (!manager.current) throw new Error("Manager not initialized");

    setLoading(true);
    try {
      await manager.current.deleteDictionary(id);
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const updateDictionaryStatus = async (
    id: string,
    status: DictionaryMetadata["status"]
  ): Promise<void> => {
    if (!manager.current) throw new Error("Manager not initialized");

    await manager.current.updateDictionaryStatus(id, status);
    await loadData();
  };

  const addCustomTemplate = async (
    template: DictionaryTemplate
  ): Promise<void> => {
    if (!manager.current) throw new Error("Manager not initialized");

    await manager.current.addCustomTemplate(template);
    setTemplates(manager.current.getTemplates());
  };

  return {
    dictionaries,
    templates,
    loading,
    totalSize,
    addDictionary,
    testParser,
    deleteDictionary,
    updateDictionaryStatus,
    addCustomTemplate,
    getDictionary: (id: string) => manager.current?.getDictionary(id),
    getTemplate: (id: string) => manager.current?.getTemplate(id),
    refresh: loadData,
  };
};
