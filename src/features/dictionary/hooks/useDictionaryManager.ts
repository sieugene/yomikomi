import { useEffect, useRef, useState, useCallback } from "react";
import { useSqlJs } from "@/features/AnkiParser/context/SqlJsProvider";
import { DictionaryManager, StoredDictionary } from "../model/dictionary-manager";
import { DictionaryMetadata, DictionaryParserConfig, DictionaryTemplate, ParserTestResult } from '../types/types';


interface UseDictionaryManagerReturn {
  dictionaries: DictionaryMetadata[];
  templates: DictionaryTemplate[];
  loading: boolean;
  totalSize: number;
  addDictionary: (
    file: File,
    templateId?: string,
    customConfig?: DictionaryParserConfig
  ) => Promise<string>;
  testParser: (
    file: File,
    config: DictionaryParserConfig,
    testTokens?: string[]
  ) => Promise<ParserTestResult>;
  deleteDictionary: (id: string) => Promise<void>;
  updateDictionaryStatus: (
    id: string,
    status: DictionaryMetadata["status"]
  ) => Promise<void>;
  addCustomTemplate: (template: DictionaryTemplate) => Promise<void>;
  getDictionary: (id: string) => Promise<StoredDictionary | null>;
  getTemplate: (id: string) => DictionaryTemplate | undefined;
  refresh: () => Promise<void>;
}

export const useDictionaryManager = (): UseDictionaryManagerReturn => {
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

  const loadData = useCallback(async () => {
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
  }, []);

  const addDictionary = useCallback(
    async (
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
    },
    [loadData]
  );

  const testParser = useCallback(
    async (
      file: File,
      config: DictionaryParserConfig,
      testTokens?: string[]
    ): Promise<ParserTestResult> => {
      if (!manager.current) throw new Error("Manager not initialized");
      return manager.current.testParser(file, config, testTokens);
    },
    []
  );

  const deleteDictionary = useCallback(
    async (id: string): Promise<void> => {
      if (!manager.current) throw new Error("Manager not initialized");

      setLoading(true);
      try {
        await manager.current.deleteDictionary(id);
        await loadData();
      } finally {
        setLoading(false);
      }
    },
    [loadData]
  );

  const updateDictionaryStatus = useCallback(
    async (id: string, status: DictionaryMetadata["status"]): Promise<void> => {
      if (!manager.current) throw new Error("Manager not initialized");

      await manager.current.updateDictionaryStatus(id, status);
      await loadData();
    },
    [loadData]
  );

  const addCustomTemplate = useCallback(
    async (template: DictionaryTemplate): Promise<void> => {
      if (!manager.current) throw new Error("Manager not initialized");

      await manager.current.addCustomTemplate(template);
      setTemplates(manager.current.getTemplates());
    },
    []
  );

  const getDictionary = useCallback((id: string) => {
    return manager.current?.getDictionary(id) || Promise.resolve(null);
  }, []);

  const getTemplate = useCallback((id: string) => {
    return manager.current?.getTemplate(id);
  }, []);

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
    getDictionary,
    getTemplate,
    refresh: loadData,
  };
};
