import useClickOutside from "@/shared/hooks/useClickOutside";
import React, { FC, useMemo, useRef, useState } from "react";
import { useDictionaryLookup } from "../hooks/useDictionaryLookup";
import { DictionaryEntry } from "../types";
import styles from "./index.module.scss";
import { UploadDictionary } from "./UploadDictionary";
import { useSqlJs } from "@/features/AnkiParser/context/SqlJsProvider";
import { useDictionariesStorage } from "../hooks/useDictionariesStorage";
import { DictionaryLookup as DictionaryLookupModel } from "../model/lookup/DictionaryLookup";
import { EnDictionaryLookup } from "../model/lookup/DictionaryParser.en";

type Props = {
  sentence: string;
  baseBottom: number;
};
export const DictionaryLookup: React.FC<Props> = ({ sentence, baseBottom }) => {
  const { sqlClient } = useSqlJs();
  const { state, store } = useDictionariesStorage();

  const [open, setOpen] = useState(false);
  const { dictionaryResult, loading, tokens } = useDictionaryLookup(sentence);
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);

  const wordById = useMemo(
    () => tokens?.find((t) => t.word_id === selectedWordId),
    [selectedWordId, tokens]
  );
  const resultsByWord = useMemo(() => {
    if (wordById) {
      return dictionaryResult?.filter(
        (w) =>
          w.word === wordById.basic_form || w.word === wordById.basic_form[0]
      );
    }
    return [];
  }, [dictionaryResult, wordById]);

  const onHide = () => {
    setOpen(false);
  };

  const tryParse = async () => {
    const currentFile = store.current.getState().data[0];
    const file = await store.current.storeManager.get(currentFile.id);

    if (file && sqlClient && tokens?.length) {
      const tokenizedWords = tokens.map((t) => t.basic_form || t.surface_form);
      const arrayBuffer = await file.content.arrayBuffer();
      const lookup = new DictionaryLookupModel(
        currentFile.name,
        arrayBuffer,
        sqlClient
      );
      const results = lookup.find(tokenizedWords);
      console.log(results,"results")
      const parsedVals = results.map((entry: any) =>
        EnDictionaryLookup.parse(Object.values(entry) as any)
      );

      debugger;
    }
  };

  return (
    <>
      <div
        style={{
          border: "1px solid red",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        <UploadDictionary
          add={(file) => store.current.add(file)}
          list={state.data}
        />
      </div>
      <div
        style={{
          border: "1px solid blue",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        <h1>Try parse with exist dictionary</h1>
        <button
          onClick={tryParse}
          style={{ border: "1px solid black", width: "150px", height: "30px" }}
        >
          try
        </button>
      </div>

      <div className={styles.sentenceBlock}>
        <div className={styles.sentence}>
          {!tokens?.length
            ? sentence
            : tokens.map((t, index) => {
                return (
                  <span
                    key={index}
                    className={styles.sentenceEl}
                    onClick={() => {
                      setSelectedWordId(t.word_id);
                      setOpen(true);
                    }}
                  >
                    {t.surface_form}
                  </span>
                );
              })}
        </div>

        <DictionaryResults
          data={resultsByWord || []}
          loading={loading}
          searchFor={wordById?.basic_form || "-"}
          baseBottom={baseBottom}
          open={open}
          onHide={onHide}
        />
      </div>
    </>
  );
};

type DictionaryResultsProps = {
  data: DictionaryEntry[];
  loading: boolean;
  searchFor: string;
  baseBottom: number;
  open: boolean;
  onHide: () => void;
};
const DictionaryResults: FC<DictionaryResultsProps> = ({
  data,
  loading,
  searchFor,
  baseBottom,
  open,
  onHide,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onHide);

  if (!open) return null;
  return (
    <div
      className={styles.dictionaryContainer}
      style={{ bottom: baseBottom }}
      ref={ref}
    >
      {loading && "loading..."}
      {data?.length > 0 ? (
        <ul className={styles.resultsList}>
          {data?.map((entry, index) => (
            <li key={index}>
              <strong>
                {entry.word} ({entry.reading})
              </strong>
              <div className={styles.meanings}>
                {entry.meanings.map((meaning: string, i: number) => (
                  <span key={i}>{meaning}</span>
                ))}
              </div>
              <small>Type: {entry.type}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.noResults}>
          No matches were found for {searchFor}
        </p>
      )}
    </div>
  );
};
