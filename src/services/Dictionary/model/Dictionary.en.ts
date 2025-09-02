import { DICTIONARY_CONFIG } from "../config/dict.config";
import { DictionaryEntry, DictionaryLookup } from "./DictionaryLookup";

type TagNode = {
  content: string | TagNode | (string | TagNode)[];
  tag: string;
  data?: { content: string };
  lang?: string;
  style?: Record<string, string>;
  href?: string;
};

type StructuredContent = {
  type: "structured-content";
  content: TagNode[] | TagNode;
};

type GlossaryEntry =
  | [
      word: string,
      reading: string,
      type: string,
      extra: string,
      id: number,
      content: StructuredContent[],
      entryId: number,
      notes: string
    ]
  | [
      word: string,
      reading: string,
      type: "forms",
      extra: string,
      id: number,
      content: string[],
      entryId: number,
      notes: string
    ];

class DictionaryEn extends DictionaryLookup<GlossaryEntry> {
  parse(entry: GlossaryEntry): DictionaryEntry {
    const [word, reading, type, , , rawContent] = entry;

    if (Array.isArray(rawContent) && typeof rawContent[0] === "string") {
      return { word, reading, type, meanings: rawContent as string[] };
    }

    const structured = rawContent as StructuredContent[];
    const meanings: string[] = [];

    for (const block of structured) {
      const contentRoot = block.content;
      const nodes = Array.isArray(contentRoot) ? contentRoot : [contentRoot];

      for (const node of nodes) {
        if (
          node.tag === "ul" &&
          node.data?.content === "glossary" &&
          Array.isArray(node.content)
        ) {
          for (const li of node.content) {
            if (
              typeof li === "object" &&
              li !== null &&
              "tag" in li &&
              li.tag === "li" &&
              typeof li.content === "string"
            ) {
              meanings.push(li.content);
            }
          }
        }
      }
    }

    return { word, reading, type, meanings };
  }
}

export const EnDictionaryLookup = new DictionaryEn(
  DICTIONARY_CONFIG.dictList.en.file
);
