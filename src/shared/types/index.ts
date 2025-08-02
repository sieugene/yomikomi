export type Note = {
  id: string;
  noteId: string;
  fields: string; // json;
  createdAt: Date;
  updatedAt: Date;
  collectionId: string;
};

export type Media = {
  type: string;
  id: string;
  path: string;
  originalName: string;
  createdAt: Date;
  updatedAt: Date;
  collectionId: string;
};
