"use client";

import { useMemo, useState } from "react";
import { HtmlWithImageHandling } from "./HtmlWithImageHandling";
import { FormattedImportData } from "@/features/AnkiParser/types";

const ITEMS_PER_PAGE = 10;

type Props = {
  data: FormattedImportData[];
};

export function NotesViewer({ data }: Props) {
  const [page, setPage] = useState(1);

  const paginatedNotes = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return data.slice(start, end);
  }, [data, page]);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  return (
    <>
      {paginatedNotes.map((item) => {
        const note = item.note;
        const fields = note.fields;
        const fieldEntries = Object.entries(fields);
        const media = item.media;

        return (
          <div
            key={note.id}
            className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all"
          >
            {fieldEntries.map(([key, value], idx) => (
              <div
                key={key}
                className={idx > 0 ? "mt-4 pt-4 border-t border-slate-800" : ""}
              >
                <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                  {key}
                </p>
                {note.id && (
                  <HtmlWithImageHandling
                    html={value}
                    media={media}
                    noteId={note.id}
                  />
                )}
              </div>
            ))}
          </div>
        );
      })}
      <div>
        <div className="flex gap-2 justify-center mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
