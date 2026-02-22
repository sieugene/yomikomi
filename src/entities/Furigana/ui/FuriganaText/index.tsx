"use client";

import React from "react";
import { FuriganaTextProps } from "../../types";
import { TokenWithFurigana } from "../TokenWithFurigana";

export const FuriganaText: React.FC<FuriganaTextProps> = ({
  tokens,
  mode = "hiragana",
  className = "",
  selectedWordId,
  onWordClick,
}) => {
  if (!tokens || tokens.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-wrap gap-x-1 gap-y-2 leading-loose ${className}`}
      style={{ lineHeight: mode !== "none" ? "2.2" : "1.6" }}
    >
      {tokens.map((token, index) => (
        <TokenWithFurigana
          key={index}
          token={token}
          mode={mode}
          isSelected={selectedWordId === token.word_id}
          onClick={() => onWordClick?.(token, token.word_id)}
        />
      ))}
    </div>
  );
};
