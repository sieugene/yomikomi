import Link from "next/link";
import { useAllCollections } from "../hooks/useCollection";
import { ROUTES } from "@/shared/routes";

export const Collections = () => {
  const data = useAllCollections();
  return (
    <div className="p-4 space-y-4">
      {data.map((a) => (
        <Link href={ROUTES.collection(a.id)} key={a.id}>
          <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-500">
            <h2 className="text-2xl font-semibold text-gray-800">{a.name}</h2>
            <p className="text-sm text-gray-500">ID: {a.id}</p>
            <p className="text-sm text-gray-400">
              Created at: {new Date(a.createdAt).toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">
              Updated at: {new Date(a.updatedAt).toLocaleString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};
