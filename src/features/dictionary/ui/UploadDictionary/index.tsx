import { ChangeEvent, FC } from "react";
import {
  DictionariesStorageState
} from "../../model/DictionariesStorage";

type Props = {
  list: DictionariesStorageState["data"];
  add: (file: File) => Promise<void>;
};
export const UploadDictionary: FC<Props> = ({ list, add }) => {
  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      await add(file);
    }
  };

  return (
    <div>
      <h1 style={{ fontWeight: "bold" }}>Upload sqlite dictionary</h1>
      <input
        type="file"
        accept=".sqlite"
        onChange={onFileChange}
        placeholder="Upload SQLite Dictionary"
      />
      <h2>Uploaded list:</h2>
      <ul>
        {list.length
          ? list.map((dict) => (
              <li key={dict.id}>
                <span>name: {dict.name}</span>
                <br />
                <span>id: {dict.id}</span>
              </li>
            ))
          : "No dictionaries uploaded yet."}
      </ul>
    </div>
  );
};
