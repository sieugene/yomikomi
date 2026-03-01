"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../button";
import { Dialog, DialogContent, DialogTitle } from "../dialog";
import { GalleryItem } from "./types";

type Props = {
  items: GalleryItem[];
  startIndex: number;
  onClose: () => void;
};

export function GalleryModal({ items, startIndex, onClose }: Props) {
  const [index, setIndex] = useState(startIndex);

  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);

  const next = () => setIndex((i) => (i + 1) % items.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const item = items[index];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="
     w-[90vw]
    max-w-none
    h-[90vh]
    border-none
    p-0
    flex
    flex-col
    "
      >
        <DialogTitle />

        <div className="relative flex items-center justify-center h-full">
          <img
            src={item.img}
            alt={item.title}
            className="max-h-[80vh] w-auto object-contain h-full"
          />

          <Button
            size="icon"
            variant="ghost"
            onClick={prev}
            className="cursor-pointer bg-black/60 absolute left-2 text-white hover:bg-white/10"
          >
            <ChevronLeft />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={next}
            className="cursor-pointer bg-black/60 absolute right-2 text-white hover:bg-white/10"
          >
            <ChevronRight />
          </Button>
        </div>

        <div className="p-6 text-center">
          <h3 className="text-black text-lg font-semibold">{item.title}</h3>
          {item.description && (
            <p className="text-black/70 mt-2">{item.description}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
