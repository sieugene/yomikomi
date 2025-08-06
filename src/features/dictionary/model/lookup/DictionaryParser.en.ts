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
      content: string,
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

function extractLiMeanings(node: TagNode): string[] {
  const result: string[] = [];

  if (node.tag === "ul" && node.data?.content === "glossary") {
    const items = Array.isArray(node.content) ? node.content : [node.content];
    for (const li of items) {
      if (
        typeof li === "object" &&
        li.tag === "li" &&
        typeof li.content === "string"
      ) {
        result.push(li.content);
      }
    }
  }

  const children = Array.isArray(node.content) ? node.content : [node.content];
  for (const child of children) {
    if (typeof child === "object" && child !== null) {
      result.push(...extractLiMeanings(child));
    }
  }

  return result;
}

class DictionaryParserEn {
  parse(entry: GlossaryEntry) {
    const [word, reading, type, , , rawContentStr] = entry;

    if (Array.isArray(rawContentStr) && typeof rawContentStr[0] === "string") {
      return { word, reading, type, meanings: rawContentStr };
    }

    let structured: StructuredContent[];

    try {
      structured = JSON.parse(rawContentStr as string);
    } catch (e) {
      console.warn("Failed to parse rawContent:", rawContentStr);
      return { word, reading, type, meanings: [] };
    }

    const meanings: string[] = [];

    for (const block of structured) {
      if (block.type !== "structured-content") continue;
      const roots = Array.isArray(block.content)
        ? block.content
        : [block.content];
      for (const root of roots) {
        meanings.push(...extractLiMeanings(root));
      }
    }

    return { word, reading, type, meanings };
  }
}

export const EnDictionaryLookup = new DictionaryParserEn();
