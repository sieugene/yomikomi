"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { VariableSizeList as List } from "react-window";
import { HtmlWithImageHandling } from "./HtmlWithImageHandling";
import { ParseApkgData } from "@/shared/lib/apkgParser";
import { FormattedImportData } from "@/features/Upload/hooks/useUpload";

type Props = {
  data: FormattedImportData[];
};

export function NotesViewer({ data }: Props) {
  const [search, setSearch] = useState("");
  const [field, setField] = useState("all");
  const listRef = useRef<List>(null);
  const itemHeights = useRef<Map<number, number>>(new Map());

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

  const getItemSize = (index: number) => {
    return itemHeights.current.get(index) ?? 200;
  };

  const setItemSize = (index: number, size: number) => {
    if (itemHeights.current.get(index) !== size) {
      itemHeights.current.set(index, size);
      listRef.current?.resetAfterIndex(index);
    }
  };

  const Item = ({ index, style, data }: any) => {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const el = ref.current;
      if (!el) return;

      const measure = () => {
        const height = el.getBoundingClientRect().height;
        setItemSize(index, height);
      };

      const observer = new ResizeObserver(measure);
      observer.observe(el);

      requestAnimationFrame(measure);

      return () => observer.disconnect();
    }, [index]);

    const dataByIndex: FormattedImportData = data[index];
    const noteId = dataByIndex.note.id;

    const handleImageLoad = () => {
      const el = ref.current;
      if (el) {
        const height = el.getBoundingClientRect().height;
        setItemSize(index, height);
      }
    };

    return (
      <div style={{ ...style, padding: "0.5rem" }} key={noteId}>
        <div ref={ref} className="p-2 border bg-white shadow">
          {Object.entries(dataByIndex.note.fields).map(([name, value]) => (
            <div key={name} className="mb-2">
              <strong>{name}:</strong>
              <HtmlWithImageHandling
                media={dataByIndex.media}
                html={value as string}
                key={noteId}
                onImageLoad={handleImageLoad}
                noteId={noteId}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-2 py-1 w-full max-w-md"
        />
        <select
          value={field}
          onChange={(e) => setField(e.target.value)}
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

      <List
        ref={listRef}
        height={600}
        width="100%"
        itemCount={filteredNotes.length}
        itemSize={getItemSize}
        itemData={filteredNotes}
      >
        {Item}
      </List>
    </div>
  );
}
