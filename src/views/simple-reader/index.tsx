import { CompactDictionaryLookup } from "@/entities/OcrCompactDictionaryLookup/ui/CompactDictionaryLookup";
import { ROUTES } from "@/shared/routes";
import { useRouter, useSearchParams } from "next/navigation";

import { useEffect, useState } from "react";

// TODO
export const SimpleReaderPage = () => {
  const searchParams = useSearchParams();
  const initialSentence = searchParams.get("sentence") || "";
  const [sentence, setSentence] = useState(initialSentence);
  const [debouncedSentence, setDebouncedSentence] = useState(sentence);
  const router = useRouter();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSentence(sentence);
    }, 700);

    return () => clearTimeout(handler);
  }, [sentence]);

  return (
    <CompactDictionaryLookup
      isOpen
      sentence={debouncedSentence}
      onClose={() => {
        router.push(ROUTES.home);
      }}
    >
      <input
        type="text"
        value={sentence}
        onChange={(event) => setSentence(event.target.value)}
        className="mt-1 block w-full border rounded-md px-3 py-2 text-sm"
        placeholder="Write or paste text here..."
      />
    </CompactDictionaryLookup>
  );
};
