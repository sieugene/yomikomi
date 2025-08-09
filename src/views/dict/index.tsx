import { DictionaryLookup } from "@/features/dictionary/ui";
import { useState } from "react";

export const DictPage = () => {
  const [input, setInput] = useState("");
  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a sentence to lookup"
      />
      <DictionaryLookup baseBottom={10} sentence={input} />
    </div>
  );
};
