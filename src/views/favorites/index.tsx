"use client";

import { useAppSettings } from "@/application/client/settings/providers/ApplicationSettingsContext";
import { useFavoriteWords } from "@/features/favorite-words/hooks/useFavoriteWords";
import { ROUTES } from "@/shared/routes";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export const FavoritesPage = () => {
  const { wordsList, removeWord, updateNotes, clearAll } = useFavoriteWords();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");
  const { compactDictionary: dictionary } = useAppSettings();

  const filteredWords = searchQuery
    ? wordsList.filter(
        (w) =>
          w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.reading.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.meanings.some((m) =>
            m.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      )
    : wordsList;

  const handleDelete = (id: string, word: string) => {
    if (window.confirm(`Remove "${word}" from favorites?`)) {
      removeWord(id);
      toast.success("Removed from favorites");
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        `Remove all ${wordsList.length} words from favorites? This cannot be undone.`,
      )
    ) {
      clearAll();
      toast.success("All favorites cleared");
    }
  };

  const handleSaveNotes = (id: string) => {
    updateNotes(id, notesText);
    setEditingNotes(null);
    toast.success("Notes saved");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                Favorite Words
              </h1>
              <p className="text-gray-600 mt-1">
                {wordsList.length} word{wordsList.length !== 1 ? "s" : ""} saved
              </p>
            </div>

            <div className="flex items-center gap-3">
              {wordsList.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          {wordsList.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search favorites..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {wordsList.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex p-4 bg-yellow-50 rounded-full mb-4">
              <Star className="w-12 h-12 text-yellow-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Favorites Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start adding words from dictionary search results
            </p>
            <Link
              href={ROUTES.dict}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Go to Dictionary
            </Link>
          </div>
        ) : (
          <div>
            {/* Words List */}
            <div className="space-y-3">
              {filteredWords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No words match your search
                </div>
              ) : (
                filteredWords.map((word) => (
                  <div
                    key={word.id}
                    className={`bg-white border rounded-lg p-4 transition-all hover:shadow-md cursor-pointer border-gray-200 overflow-hidden`}
                    onClick={() => dictionary.handleOpen(word.word)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-[70%]">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate max-w-32">
                            {word.word}
                          </h3>
                          {word.reading && (
                            <span className="text-gray-600">
                              ({word.reading})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(word.addedAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">
                            {word.source}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNotes(word.id);
                            setNotesText(word.notes || "");
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit notes"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(word.id, word.word);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {word.meanings.slice(0, 3).map((meaning, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded"
                        >
                          {meaning}
                        </span>
                      ))}
                      {word.meanings.length > 3 && (
                        <span className="text-xs px-2 py-1 text-gray-500">
                          +{word.meanings.length - 3} more
                        </span>
                      )}
                    </div>

                    {word.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                        {word.notes}
                      </div>
                    )}

                    {/* Notes Editor */}
                    {editingNotes === word.id && (
                      <div
                        className="mt-3 space-y-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <textarea
                          value={notesText}
                          onChange={(e) => setNotesText(e.target.value)}
                          placeholder="Add notes..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingNotes(null)}
                            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNotes(word.id)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
