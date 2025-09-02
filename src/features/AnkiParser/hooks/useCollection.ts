import { useState } from "react";

type MockCollection = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export const useAllCollections = () => {
  const [data] = useState<MockCollection[]>([]);
  return data
};

export const useCollectionById = (_collectionId: string) => {
  const [data] = useState<MockCollection[]>([]);
  console.log(_collectionId)

  return { data };
};
