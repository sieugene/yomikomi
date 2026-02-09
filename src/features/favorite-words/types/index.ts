export interface FavoriteWord {
  id: string;
  word: string;
  reading: string;
  meanings: string[];
  source: string;
  addedAt: Date;
  notes?: string;
}
