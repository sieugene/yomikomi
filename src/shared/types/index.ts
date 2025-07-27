export type Media = {
  id: string;
  path: string;
  type: string;
  originalName: string;
  createdAt: Date;
  updatedAt: Date;
  collectionId: string;
};
export type Note = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  collectionId: string;
  noteId: string;
  fields: string; // JSON stringified object;
};
