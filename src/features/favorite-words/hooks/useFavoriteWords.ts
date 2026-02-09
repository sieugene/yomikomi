import { SearchResult } from "@/features/dictionary-search/types";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { FAVORITE_WORDS_LOCALSTORAGE_KEY } from "../lib/constants";
import { FavoriteWord } from "../types";

export const useFavoriteWords = () => {
  const [wordsList, setWordsList] = useState<FavoriteWord[]>(() => {
    try {
      const raw = localStorage.getItem(FAVORITE_WORDS_LOCALSTORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.map((w: FavoriteWord) => ({
          ...w,
          addedAt: new Date(w.addedAt),
        }));
      }
      return [];
    } catch (e) {
      console.error("Failed to load favorite words:", e);
      return [];
    }
  });

  const saveToStorage = useCallback((words: FavoriteWord[]) => {
    try {
      localStorage.setItem(
        FAVORITE_WORDS_LOCALSTORAGE_KEY,
        JSON.stringify(words),
      );
    } catch (e) {
      console.error("Failed to save favorite words:", e);
    }
  }, []);

  const addWord = useCallback(
    (word: Omit<FavoriteWord, "id" | "addedAt">) => {
      const newWord: FavoriteWord = {
        ...word,
        id: uuidv4(),
        addedAt: new Date(),
      };

      setWordsList((prev) => {
        const updated = [newWord, ...prev];
        saveToStorage(updated);
        return updated;
      });

      return newWord;
    },
    [saveToStorage],
  );

  const removeWord = useCallback(
    (id: string) => {
      setWordsList((prev) => {
        const updated = prev.filter((w) => w.id !== id);
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage],
  );

  const isFavorite = useCallback(
    (word: string, reading: string) => {
      return wordsList.some((w) => w.word === word && w.reading === reading);
    },
    [wordsList],
  );

  const getFavoriteId = useCallback(
    (word: string, reading: string) => {
      return wordsList.find((w) => w.word === word && w.reading === reading)
        ?.id;
    },
    [wordsList],
  );

  const updateNotes = useCallback(
    (id: string, notes: string) => {
      setWordsList((prev) => {
        const updated = prev.map((w) => (w.id === id ? { ...w, notes } : w));
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage],
  );

  const clearAll = useCallback(() => {
    setWordsList([]);
    localStorage.removeItem(FAVORITE_WORDS_LOCALSTORAGE_KEY);
  }, []);

  const handleToggleFavorite = (result: SearchResult) => {
    const isCurrentlyFavorite = isFavorite(result.word, result.reading);

    if (isCurrentlyFavorite) {
      const id = getFavoriteId(result.word, result.reading);
      if (id) {
        removeWord(id);
        toast.success("Removed from favorites");
      }
    } else {
      addWord({
        word: result.word,
        reading: result.reading,
        meanings: result.meanings,
        source: result.source,
      });
      toast.success("Added to favorites");
    }
  };

  return {
    handleToggleFavorite,
    wordsList,
    addWord,
    removeWord,
    isFavorite,
    getFavoriteId,
    updateNotes,
    clearAll,
  };
};
