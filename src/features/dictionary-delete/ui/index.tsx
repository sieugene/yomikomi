import { DictionaryMetadata } from "@/features/dictionary/types";
import { FC } from "react";
import { useDictionaryDelete } from "../hooks/useDictionaryDelete";

type Props = {
  id: DictionaryMetadata["id"];
};
export const DictionaryDelete: FC<Props> = ({ id }) => {
  const { deleteDictionary } = useDictionaryDelete();
  return (
    <>
      <button
        onClick={() => {
          if (
            window.confirm("Are you sure you want to delete this dictionary?")
          ) {
            deleteDictionary(id);
          }
        }}
        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
      >
        Delete
      </button>
    </>
  );
};
