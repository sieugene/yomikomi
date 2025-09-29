import { DictionaryLookup } from "@/features/dictionary/ui";

export const DictPage = () => {
  return (
    <div>
      <DictionaryLookup baseBottom={10} sentence={"これは辞書を確認するためのテスト文です"} />
    </div>
  );
};
