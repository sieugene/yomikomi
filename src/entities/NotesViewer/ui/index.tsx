"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HtmlWithImageHandling } from "./HtmlWithImageHandling";
import { FormattedImportData } from "@/features/Collection/types";

const ITEMS_PER_PAGE = 10;

type Props = {
  data: FormattedImportData[];
};

export function NotesViewer({ data }: Props) {
  const [search, setSearch] = useState("");
  const [field, setField] = useState("all");
  const [page, setPage] = useState(1);

  const filteredNotes = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return data;

    return data.filter(({ note }) =>
      field === "all"
        ? Object.values(note.fields).some((val) =>
            val.toLowerCase().includes(keyword)
          )
        : (note.fields[field]?.toLowerCase() ?? "").includes(keyword)
    );
  }, [search, field, data]);

  const paginatedNotes = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredNotes.slice(start, end);
  }, [filteredNotes, page]);

  const totalPages = Math.ceil(filteredNotes.length / ITEMS_PER_PAGE);

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border px-2 py-1 w-full max-w-md"
        />
        <select
          value={field}
          onChange={(e) => {
            setField(e.target.value);
            setPage(1);
          }}
          className="border px-2 py-1"
        >
          <option value="all">By all fields</option>
          {Object.keys(data[0]?.note?.fields ?? {}).map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {paginatedNotes.map(({ note, media }) => (
        <div key={note.id} className="mb-4 p-4 border bg-white shadow">
          {Object.entries(note.fields).map((fields) => {
            const [name, value] = fields;
            return (
              <div key={`${note.id}-${name}`} className="mb-2">
                <strong>{name}:</strong>
                <HtmlWithImageHandling
                  media={media}
                  html={value}
                  noteId={note.id}
                />
              </div>
            );
          })}
        </div>
      ))}

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
  );
}
