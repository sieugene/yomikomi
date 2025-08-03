import useClickOutside from "@/shared/hooks/useClickOutside";
import React, { FC, useMemo, useRef, useState } from "react";
import { useDictionaryLookup } from "../hooks/useDictionaryLookup";
import { DictionaryEntry } from "../types";
import styles from "./index.module.scss";

type Props = {
  sentence: string;
  baseBottom: number;
};
export const DictionaryLookup: React.FC<Props> = ({ sentence, baseBottom }) => {
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

  return (
    <>
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
