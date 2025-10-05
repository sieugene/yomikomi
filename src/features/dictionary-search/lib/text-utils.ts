export function normalizeTerm(t: string): string {
  return String(t || "")
    .normalize("NFKC")
    .trim();
}

export function isLikelyKana(s: string): boolean {
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    if (
      (code >= 0x3040 && code <= 0x309f) ||
      (code >= 0x30a0 && code <= 0x30ff)
    )
      return true;
  }
  return false;
}
