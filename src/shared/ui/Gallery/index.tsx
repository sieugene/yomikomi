"use client";

import Image from "next/image";
import { useState } from "react";
import { GalleryItem } from "./types";
import { GalleryModal } from "./GalleryModal";

type Props = {
  items: GalleryItem[];
};

export function GalleryGrid({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => setOpenIndex(i)}
            className="group relative rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 focus:outline-none"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />

            <Image
              src={item.img}
              alt={item.title}
              width={400}
              height={800}
              className="w-full h-auto object-cover"
            />

            <div className="absolute bottom-0 z-20 p-4 text-left opacity-0 group-hover:opacity-100 transition-opacity">
              <h3 className="text-white font-semibold">{item.title}</h3>
              {item.description && (
                <p className="text-white/80 text-sm">{item.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <GalleryModal
          items={items}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
