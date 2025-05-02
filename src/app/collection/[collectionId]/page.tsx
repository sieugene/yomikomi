"use client";

import { NotesViewer } from "@/entities/NotesViewer/ui";
import { useCollectionById } from "@/features/Collection/hooks/useCollection";
import { useParams } from "next/navigation";

const CollectionPage = () => {
  const params = useParams() as { collectionId: string };

  const { data } = useCollectionById(params.collectionId);

  return (
    <div>
      <NotesViewer data={data} />{" "}
    </div>
  );
};

export default CollectionPage;
