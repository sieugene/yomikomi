"use client";
import { NotesViewer } from "@/entities/NotesViewer/ui";
import { SqlJsProvider } from "@/features/AnkiParser/context/SqlJsProvider";
import { useCloudParse } from "@/features/AnkiParser/hooks/useCloudParse";

const Page = () => {
  const { upload, data, setUrl, url } = useCloudParse();

  return (
    <div className="p-4">
      <input
        type="url"
        placeholder="Enter a url"
        onChange={(event) => {
          event.target.value && setUrl(event.target.value);
        }}
        value={url}
      />
      <button onClick={upload}>Submit</button>
      <h2>Imported card from cloud: </h2>
      <NotesViewer data={data} />{" "}
    </div>
  );
};

const GetCloudPage = () => {
  return (
    <SqlJsProvider>
      <Page />
    </SqlJsProvider>
  );
};
export default GetCloudPage;
