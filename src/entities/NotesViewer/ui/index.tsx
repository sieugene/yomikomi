"use client";
import { ParseApkgData } from "@/lib/apkgParser";
import { useEffect, useMemo, useRef, useState } from "react";
import { VariableSizeList as List } from "react-window";
import { HtmlWithImageHandling } from "./HtmlWithImageHandling";

type Props = {
  notes: ParseApkgData["notes"];
};

export function NotesViewer({ notes }: Props) {
  const [search, setSearch] = useState("");
  const [field, setField] = useState("all");
  const listRef = useRef<List>(null);
  const itemHeights = useRef<Map<number, number>>(new Map());

  const filteredNotes = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return notes;

    return notes.filter((note) =>
      field === "all"
        ? Object.values(note.fields).some((val) =>
            val.toLowerCase().includes(keyword)
          )
        : (note.fields[field]?.toLowerCase() ?? "").includes(keyword)
    );
  }, [search, field, notes]);

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

    const note = data[index];
    const noteId = note.id as string;

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
          {Object.entries(note.fields).map(([name, value]) => (
            <div key={name} className="mb-2">
              <strong>{name}:</strong>
              <HtmlWithImageHandling
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
          {Object.keys(notes[0]?.fields ?? {}).map((f) => (
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
